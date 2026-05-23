import * as ts from "typescript"
import * as lua from "typescript-to-lua"
import { walkBlocks, walkIdentifiers, containsIdentifier } from "./lua-ast-walk.js"
import { SLUA_GLOBAL_NAMES } from "./generated/slua-globals.js"

const JSDOC_TAG_RE = /@(?:index(?:Arg|Return)|define)\b/

/**
 * Strip internal JSDoc tags from Lua comments (@indexArg, @indexReturn, @define).
 * These are only consumed by the plugin at transpile time.
 *
 * TSTL generates JSDoc as flat string arrays in leadingComments:
 *   ["-", " @define FLAG", " continuation line", " @indexArg 0"]
 * Each string becomes a `-- <text>` line. When we find a tag line, we also
 * remove its continuation lines (those starting with ` ` but not ` @`).
 */
export function stripInternalJSDocTags(file: lua.File): boolean {
  let changed = false

  walkBlocks(file, (statements) => {
    for (const stmt of statements) {
      if (!stmt.leadingComments || stmt.leadingComments.length === 0) continue

      const filtered: Array<string | string[]> = []
      let skip = false

      for (const comment of stmt.leadingComments) {
        if (typeof comment === "string") {
          if (JSDOC_TAG_RE.test(comment)) {
            // Tag line, skip it and subsequent continuation lines
            skip = true
            continue
          }

          if (skip) {
            // Continuation line: starts with space but not with ` @tag`
            if (comment.startsWith(" ") && !comment.match(/^ @\w/)) {
              continue
            }

            // Not a continuation, stop skipping
            skip = false
          }

          filtered.push(comment)
        } else {
          // Block comment (string[]), strip if any line contains the tag
          skip = false

          if (comment.some((line) => JSDOC_TAG_RE.test(line))) {
            continue
          }

          filtered.push(comment)
        }
      }

      // If only the JSDoc opener "-" remains, remove it too
      if (filtered.length === 1 && filtered[0] === "-") {
        filtered.length = 0
      }

      if (filtered.length !== stmt.leadingComments.length) {
        stmt.leadingComments = filtered.length > 0 ? filtered : undefined
        changed = true
      }
    }
  })

  return changed
}

/**
 * Strip empty module boilerplate from files without explicit exports.
 * `moduleDetection: "force"` causes TSTL to wrap every file as a module;
 * standalone SLua scripts don't need the ____exports wrapper.
 */
export function stripEmptyModuleBoilerplate(
  file: lua.File,
  sourceFiles: readonly ts.SourceFile[] | undefined,
): boolean {
  const stmts = file.statements
  if (stmts.length < 2) return false

  // Find `local ____exports = {}` at top level
  const declIdx = stmts.findIndex(
    (s) =>
      lua.isVariableDeclarationStatement(s) &&
      s.left.length === 1 &&
      s.left[0].text === "____exports" &&
      s.right &&
      s.right.length === 1 &&
      lua.isTableExpression(s.right[0]) &&
      s.right[0].fields.length === 0,
  )

  if (declIdx === -1) return false

  // Find `return ____exports` at end
  const last = stmts[stmts.length - 1]
  if (
    !lua.isReturnStatement(last) ||
    last.expressions.length !== 1 ||
    !lua.isIdentifier(last.expressions[0]) ||
    last.expressions[0].text !== "____exports"
  ) {
    return false
  }

  // Check TS source files for explicit exports
  const hasExplicitExports = sourceFiles?.some((sf) =>
    sf.statements.some(
      (s) =>
        ts.isExportDeclaration(s) ||
        ts.isExportAssignment(s) ||
        (ts.canHaveModifiers(s) &&
          ts.getModifiers(s)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)),
    ),
  )

  if (hasExplicitExports) return false

  // Remove both: the decl and the return
  stmts.splice(stmts.length - 1, 1) // remove return first (higher index)
  stmts.splice(declIdx, 1) // then remove decl

  return true
}

/**
 * Collapse default-parameter nil-checks into `x = x or <literal>`.
 * Matches: if x == nil then x = <literal> end
 * Safe for strings and numbers (both truthy in Lua); the TS source only
 * generates these for string/number defaults.
 */
export function collapseDefaultParamNilChecks(file: lua.File): boolean {
  let changed = false

  walkBlocks(file, (statements) => {
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      if (!lua.isIfStatement(stmt)) continue
      if (stmt.elseBlock) continue

      // condition: x == nil
      if (!lua.isBinaryExpression(stmt.condition)) continue
      if (stmt.condition.operator !== lua.SyntaxKind.EqualityOperator) continue
      if (!lua.isIdentifier(stmt.condition.left)) continue
      if (!lua.isNilLiteral(stmt.condition.right)) continue

      const paramName = stmt.condition.left

      // ifBlock has exactly 1 statement: x = <literal>
      if (stmt.ifBlock.statements.length !== 1) continue

      const inner = stmt.ifBlock.statements[0]
      if (!lua.isAssignmentStatement(inner)) continue
      if (inner.left.length !== 1 || inner.right.length !== 1) continue

      const assignTarget = inner.left[0]
      if (!lua.isIdentifier(assignTarget)) continue
      if (assignTarget.text !== paramName.text) continue

      const literal = inner.right[0]
      if (!lua.isStringLiteral(literal) && !lua.isNumericLiteral(literal)) {
        continue
      }

      // Replace with: x = x or <literal>
      const orExpr = lua.createBinaryExpression(
        lua.cloneIdentifier(paramName),
        literal,
        lua.SyntaxKind.OrOperator,
      )

      const assignment = lua.createAssignmentStatement(lua.cloneIdentifier(paramName), orExpr)

      // Preserve leading comments from the if statement
      if (stmt.leadingComments) {
        assignment.leadingComments = stmt.leadingComments
      }

      statements[i] = assignment
      changed = true
    }
  })

  return changed
}

/**
 * Rewrite `not (x ~= nil)` to `x == nil`.
 *
 * TSTL emits `not (x ~= nil)` when double-negated null checks survive
 * (e.g. `!(x !== null)` in source, or after folds that re-wrap an
 * inequality). The simplified form saves a `not`, a pair of parens, and
 * matches hand-written Lua idiom.
 */
export function simplifyNegatedInequality(file: lua.File): boolean {
  let changed = false

  function tryMatch(expr: lua.Expression): lua.Expression | undefined {
    if (!lua.isUnaryExpression(expr)) return undefined
    if (expr.operator !== lua.SyntaxKind.NotOperator) return undefined

    let inner: lua.Expression = expr.operand
    if (lua.isParenthesizedExpression(inner)) inner = inner.expression

    if (
      !lua.isBinaryExpression(inner) ||
      inner.operator !== lua.SyntaxKind.InequalityOperator ||
      !lua.isNilLiteral(inner.right)
    ) {
      return undefined
    }

    return lua.createBinaryExpression(inner.left, inner.right, lua.SyntaxKind.EqualityOperator)
  }

  function rewrite(expr: lua.Expression): lua.Expression {
    // Descend first so inner `not (... ~= nil)` resolves before outer match.
    if (lua.isBinaryExpression(expr)) {
      expr.left = rewrite(expr.left)
      expr.right = rewrite(expr.right)
    } else if (lua.isUnaryExpression(expr)) {
      expr.operand = rewrite(expr.operand)
    } else if (lua.isParenthesizedExpression(expr)) {
      expr.expression = rewrite(expr.expression)
    } else if (lua.isConditionalExpression(expr)) {
      expr.condition = rewrite(expr.condition)
      expr.whenTrue = rewrite(expr.whenTrue)
      expr.whenFalse = rewrite(expr.whenFalse)
    } else if (lua.isCallExpression(expr)) {
      expr.expression = rewrite(expr.expression) as typeof expr.expression
      expr.params = expr.params.map(rewrite)
    } else if (lua.isMethodCallExpression(expr)) {
      expr.prefixExpression = rewrite(expr.prefixExpression) as typeof expr.prefixExpression
      expr.params = expr.params.map(rewrite)
    } else if (lua.isTableIndexExpression(expr)) {
      expr.table = rewrite(expr.table) as typeof expr.table
      expr.index = rewrite(expr.index)
    } else if (lua.isTableExpression(expr)) {
      for (const field of expr.fields) {
        field.value = rewrite(field.value)
        if (field.key) field.key = rewrite(field.key)
      }
    }
    // FunctionExpression body is reached via walkBlocks below.

    const replaced = tryMatch(expr)
    if (replaced) {
      changed = true
      return replaced
    }

    return expr
  }

  walkBlocks(file, (statements) => {
    for (const stmt of statements) {
      if (lua.isVariableDeclarationStatement(stmt)) {
        if (stmt.right) stmt.right = stmt.right.map(rewrite)
      } else if (lua.isAssignmentStatement(stmt)) {
        stmt.left = stmt.left.map((l) => rewrite(l) as lua.AssignmentLeftHandSideExpression)
        stmt.right = stmt.right.map(rewrite)
      } else if (lua.isIfStatement(stmt)) {
        stmt.condition = rewrite(stmt.condition)
      } else if (lua.isWhileStatement(stmt) || lua.isRepeatStatement(stmt)) {
        stmt.condition = rewrite(stmt.condition)
      } else if (lua.isForStatement(stmt)) {
        stmt.controlVariableInitializer = rewrite(stmt.controlVariableInitializer)
        stmt.limitExpression = rewrite(stmt.limitExpression)
        if (stmt.stepExpression) stmt.stepExpression = rewrite(stmt.stepExpression)
      } else if (lua.isForInStatement(stmt)) {
        stmt.expressions = stmt.expressions.map(rewrite)
      } else if (lua.isReturnStatement(stmt)) {
        stmt.expressions = stmt.expressions.map(rewrite)
      } else if (lua.isExpressionStatement(stmt)) {
        stmt.expression = rewrite(stmt.expression)
      }
    }
  })

  return changed
}

/**
 * Shorten generated temp names (`____<name>_<n>`) to `_rN` — covers TSTL's
 * destructuring/result temps and the plugin's own (e.g. `____ends_N`). The
 * trailing `_\d+` is required so reserved names like `____exports` are untouched.
 * Two-pass: collect unique names in order, then rename all identifiers.
 */
export function shortenTempNames(file: lua.File): boolean {
  const seen = new Map<string, string>()
  let counter = 0
  const tempRe = /^____\w+_\d+$/

  // Pass 1: collect unique temp names in order of first occurrence
  walkIdentifiers(file, (id) => {
    if (tempRe.test(id.text) && !seen.has(id.text)) {
      seen.set(id.text, `_r${counter++}`)
    }
  })

  if (seen.size === 0) return false

  // Pass 2: rename all matching identifiers
  walkIdentifiers(file, (id) => {
    const short = seen.get(id.text)
    if (short) id.text = short
  })

  return true
}

/**
 * Collapse consecutive field accesses from the same shortened temp into
 * multi-assignment: `local a = _r0.x; local b = _r0.y` -> `local a, b = _r0.x, _r0.y`.
 * Only collapses when the base matches `_r\d+` (shortened temps).
 */
export function collapseFieldAccesses(file: lua.File): boolean {
  let changed = false
  const tempBaseRe = /^_r\d+$/

  walkBlocks(file, (statements) => {
    let i = 0

    while (i < statements.length) {
      const stmt = statements[i]

      // Match: local <name> = <temp>.<field>
      if (
        !lua.isVariableDeclarationStatement(stmt) ||
        stmt.left.length !== 1 ||
        !stmt.right ||
        stmt.right.length !== 1 ||
        !lua.isTableIndexExpression(stmt.right[0]) ||
        !lua.isIdentifier(stmt.right[0].table) ||
        !tempBaseRe.test(stmt.right[0].table.text)
      ) {
        i++
        continue
      }

      const baseName = (stmt.right[0].table as lua.Identifier).text

      // Look ahead for consecutive field accesses on the same base
      const left: lua.Identifier[] = [...stmt.left]
      const right: lua.Expression[] = [...stmt.right]
      let end = i + 1

      while (end < statements.length) {
        const next = statements[end]

        if (
          lua.isVariableDeclarationStatement(next) &&
          next.left.length === 1 &&
          next.right &&
          next.right.length === 1 &&
          lua.isTableIndexExpression(next.right[0]) &&
          lua.isIdentifier(next.right[0].table) &&
          next.right[0].table.text === baseName
        ) {
          left.push(...next.left)
          right.push(...next.right)
          end++
        } else {
          break
        }
      }

      if (end - i > 1) {
        // Create merged multi-assignment
        const merged = lua.createVariableDeclarationStatement(left, right)

        if (stmt.leadingComments) {
          merged.leadingComments = stmt.leadingComments
        }

        statements.splice(i, end - i, merged)

        changed = true
      }

      i++
    }
  })

  return changed
}

/**
 * Merge forward-declared `local x` with its first `x = value` assignment.
 * Only inlines when there are no references to x between declaration and assignment.
 */
export function inlineForwardDeclarations(file: lua.File): boolean {
  let changed = false

  walkBlocks(file, (statements) => {
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]

      // Match forward declaration: `local var1, var2, ...` with no initializer
      if (!lua.isVariableDeclarationStatement(stmt) || (stmt.right && stmt.right.length > 0)) {
        continue
      }

      const vars = stmt.left
      const inlined = new Set<string>()

      for (const varId of vars) {
        const varName = varId.text

        // Scan forward for assignment to same identifier
        for (let j = i + 1; j < statements.length; j++) {
          const candidate = statements[j]

          if (
            lua.isAssignmentStatement(candidate) &&
            candidate.left.length === 1 &&
            lua.isIdentifier(candidate.left[0]) &&
            candidate.left[0].text === varName &&
            candidate.right.length === 1
          ) {
            // Don't inline if RHS references the variable (self-referencing)
            if (containsIdentifier(candidate.right[0], varName)) break

            // Don't inline multi-variable assignments like `a, b = fn()`
            // (already handled by the length check above)

            // Replace assignment with variable declaration
            const newDecl = lua.createVariableDeclarationStatement(
              lua.cloneIdentifier(candidate.left[0]),
              candidate.right[0],
            )

            if (candidate.leadingComments) {
              newDecl.leadingComments = candidate.leadingComments
            }

            statements[j] = newDecl

            inlined.add(varName)
            break
          }

          // Reference to varName prevents inlining
          if (containsIdentifier(candidate, varName)) break
        }
      }

      if (inlined.size === 0) continue

      changed = true

      const remaining = vars.filter((v) => !inlined.has(v.text))
      if (remaining.length === 0) {
        // Remove the forward declaration entirely
        statements.splice(i, 1)
        i-- // re-check this index
      } else {
        // Keep remaining vars in the forward declaration
        statements[i] = lua.createVariableDeclarationStatement(remaining)

        if (stmt.leadingComments) {
          ;(statements[i] as lua.VariableDeclarationStatement).leadingComments =
            stmt.leadingComments
        }
      }
    }
  })

  return changed
}

type MinifyScope = {
  parent?: MinifyScope
  originals: Set<string>
  active: Set<string>
  aliases: Map<string, string>
  used: Set<string>
  nextName: number
}

const LUA_RESERVED_NAMES = new Set([
  "and",
  "break",
  "do",
  "else",
  "elseif",
  "end",
  "false",
  "for",
  "function",
  "goto",
  "if",
  "in",
  "local",
  "nil",
  "not",
  "or",
  "repeat",
  "return",
  "then",
  "true",
  "until",
  "while",
])

const MINIFY_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

/** Rename Lua locals, params and loop variables while preserving lexical resolution. */
export function minifyLocalNames(file: lua.File): boolean {
  const blockNames = new WeakMap<object, Set<string>>()
  collectBlockLocalNames(file, blockNames)
  const root = createMinifyScope(undefined, blockNames.get(file) ?? new Set())
  return rewriteBlockNames(file, root, blockNames, false)
}

function collectBlockLocalNames(
  block: { statements: lua.Statement[] },
  out: WeakMap<object, Set<string>>,
): void {
  const names = getBlockNameSet(block, out)
  for (const stmt of block.statements) {
    collectStatementLocalNames(stmt, names, out)
  }
}

function collectStatementLocalNames(
  stmt: lua.Statement,
  names: Set<string>,
  out: WeakMap<object, Set<string>>,
): void {
  if (lua.isVariableDeclarationStatement(stmt)) {
    for (const id of stmt.left) names.add(id.text)
    if (stmt.right) {
      for (const expr of stmt.right) collectExpressionLocalNames(expr, out)
    }
    return
  }

  if (lua.isAssignmentStatement(stmt)) {
    for (const expr of stmt.left) collectExpressionLocalNames(expr, out)
    for (const expr of stmt.right) collectExpressionLocalNames(expr, out)
    return
  }

  if (lua.isIfStatement(stmt)) {
    collectExpressionLocalNames(stmt.condition, out)
    collectBlockLocalNames(stmt.ifBlock, out)
    if (stmt.elseBlock) {
      if (lua.isIfStatement(stmt.elseBlock)) {
        collectStatementLocalNames(stmt.elseBlock, new Set(), out)
      } else {
        collectBlockLocalNames(stmt.elseBlock, out)
      }
    }
    return
  }

  if (lua.isDoStatement(stmt)) {
    collectBlockLocalNames(stmt, out)
    return
  }

  if (lua.isForStatement(stmt)) {
    collectExpressionLocalNames(stmt.controlVariableInitializer, out)
    collectExpressionLocalNames(stmt.limitExpression, out)
    if (stmt.stepExpression) collectExpressionLocalNames(stmt.stepExpression, out)
    const bodyNames = getBlockNameSet(stmt.body, out)
    bodyNames.add(stmt.controlVariable.text)
    collectBlockLocalNames(stmt.body, out)
    return
  }

  if (lua.isForInStatement(stmt)) {
    for (const expr of stmt.expressions) collectExpressionLocalNames(expr, out)
    const bodyNames = getBlockNameSet(stmt.body, out)
    for (const id of stmt.names) bodyNames.add(id.text)
    collectBlockLocalNames(stmt.body, out)
    return
  }

  if (lua.isWhileStatement(stmt) || lua.isRepeatStatement(stmt)) {
    collectExpressionLocalNames(stmt.condition, out)
    collectBlockLocalNames(stmt.body, out)
    return
  }

  if (lua.isReturnStatement(stmt)) {
    for (const expr of stmt.expressions) collectExpressionLocalNames(expr, out)
    return
  }

  if (lua.isExpressionStatement(stmt)) {
    collectExpressionLocalNames(stmt.expression, out)
  }
}

function collectExpressionLocalNames(
  expr: lua.Expression,
  out: WeakMap<object, Set<string>>,
): void {
  if (lua.isFunctionExpression(expr)) {
    const names = getBlockNameSet(expr.body, out)
    for (const param of expr.params ?? []) names.add(param.text)
    collectBlockLocalNames(expr.body, out)
    return
  }

  if (lua.isBinaryExpression(expr)) {
    collectExpressionLocalNames(expr.left, out)
    collectExpressionLocalNames(expr.right, out)
  } else if (lua.isUnaryExpression(expr)) {
    collectExpressionLocalNames(expr.operand, out)
  } else if (lua.isParenthesizedExpression(expr)) {
    collectExpressionLocalNames(expr.expression, out)
  } else if (lua.isConditionalExpression(expr)) {
    collectExpressionLocalNames(expr.condition, out)
    collectExpressionLocalNames(expr.whenTrue, out)
    collectExpressionLocalNames(expr.whenFalse, out)
  } else if (lua.isCallExpression(expr)) {
    collectExpressionLocalNames(expr.expression, out)
    for (const param of expr.params) collectExpressionLocalNames(param, out)
  } else if (lua.isMethodCallExpression(expr)) {
    collectExpressionLocalNames(expr.prefixExpression, out)
    for (const param of expr.params) collectExpressionLocalNames(param, out)
  } else if (lua.isTableIndexExpression(expr)) {
    collectExpressionLocalNames(expr.table, out)
    collectExpressionLocalNames(expr.index, out)
  } else if (lua.isTableExpression(expr)) {
    for (const field of expr.fields) {
      collectExpressionLocalNames(field.value, out)
      if (field.key) collectExpressionLocalNames(field.key, out)
    }
  } else if (lua.isTableFieldExpression(expr)) {
    collectExpressionLocalNames(expr.value, out)
    if (expr.key) collectExpressionLocalNames(expr.key, out)
  }
}

function getBlockNameSet(block: object, out: WeakMap<object, Set<string>>): Set<string> {
  let names = out.get(block)
  if (names === undefined) {
    names = new Set()
    out.set(block, names)
  }
  return names
}

function createMinifyScope(parent: MinifyScope | undefined, originals: Set<string>): MinifyScope {
  return {
    parent,
    originals,
    active: new Set(),
    aliases: new Map(),
    used: new Set(originals),
    nextName: 0,
  }
}

function rewriteBlockNames(
  block: { statements: lua.Statement[] },
  scope: MinifyScope,
  blockNames: WeakMap<object, Set<string>>,
  activateExisting: boolean,
): boolean {
  let changed = false
  if (activateExisting) {
    for (const name of scope.originals) {
      activateMinifiedName(name, scope)
    }
  }
  for (const stmt of block.statements) {
    changed = rewriteStatementNames(stmt, scope, blockNames) || changed
  }
  return changed
}

function rewriteStatementNames(
  stmt: lua.Statement,
  scope: MinifyScope,
  blockNames: WeakMap<object, Set<string>>,
): boolean {
  let changed = false

  if (lua.isVariableDeclarationStatement(stmt)) {
    if (stmt.right) {
      for (const expr of stmt.right)
        changed = rewriteExpressionNames(expr, scope, blockNames) || changed
    }
    for (const id of stmt.left) changed = activateIdentifier(id, scope) || changed
  } else if (lua.isAssignmentStatement(stmt)) {
    for (const expr of stmt.left)
      changed = rewriteExpressionNames(expr, scope, blockNames) || changed
    for (const expr of stmt.right)
      changed = rewriteExpressionNames(expr, scope, blockNames) || changed
  } else if (lua.isIfStatement(stmt)) {
    changed = rewriteExpressionNames(stmt.condition, scope, blockNames) || changed
    changed =
      rewriteBlockNames(
        stmt.ifBlock,
        createMinifyScope(scope, blockNames.get(stmt.ifBlock) ?? new Set()),
        blockNames,
        false,
      ) || changed
    if (stmt.elseBlock) {
      if (lua.isIfStatement(stmt.elseBlock)) {
        changed = rewriteStatementNames(stmt.elseBlock, scope, blockNames) || changed
      } else {
        changed =
          rewriteBlockNames(
            stmt.elseBlock,
            createMinifyScope(scope, blockNames.get(stmt.elseBlock) ?? new Set()),
            blockNames,
            false,
          ) || changed
      }
    }
  } else if (lua.isDoStatement(stmt)) {
    changed =
      rewriteBlockNames(
        stmt,
        createMinifyScope(scope, blockNames.get(stmt) ?? new Set()),
        blockNames,
        false,
      ) || changed
  } else if (lua.isForStatement(stmt)) {
    changed = rewriteExpressionNames(stmt.controlVariableInitializer, scope, blockNames) || changed
    changed = rewriteExpressionNames(stmt.limitExpression, scope, blockNames) || changed
    if (stmt.stepExpression)
      changed = rewriteExpressionNames(stmt.stepExpression, scope, blockNames) || changed
    const bodyScope = createMinifyScope(scope, blockNames.get(stmt.body) ?? new Set())
    changed = activateIdentifier(stmt.controlVariable, bodyScope) || changed
    changed = rewriteBlockNames(stmt.body, bodyScope, blockNames, false) || changed
  } else if (lua.isForInStatement(stmt)) {
    for (const expr of stmt.expressions)
      changed = rewriteExpressionNames(expr, scope, blockNames) || changed
    const bodyScope = createMinifyScope(scope, blockNames.get(stmt.body) ?? new Set())
    for (const id of stmt.names) changed = activateIdentifier(id, bodyScope) || changed
    changed = rewriteBlockNames(stmt.body, bodyScope, blockNames, false) || changed
  } else if (lua.isWhileStatement(stmt) || lua.isRepeatStatement(stmt)) {
    changed = rewriteExpressionNames(stmt.condition, scope, blockNames) || changed
    changed =
      rewriteBlockNames(
        stmt.body,
        createMinifyScope(scope, blockNames.get(stmt.body) ?? new Set()),
        blockNames,
        false,
      ) || changed
  } else if (lua.isReturnStatement(stmt)) {
    for (const expr of stmt.expressions)
      changed = rewriteExpressionNames(expr, scope, blockNames) || changed
  } else if (lua.isExpressionStatement(stmt)) {
    changed = rewriteExpressionNames(stmt.expression, scope, blockNames) || changed
  }

  return changed
}

function rewriteExpressionNames(
  expr: lua.Expression,
  scope: MinifyScope,
  blockNames: WeakMap<object, Set<string>>,
): boolean {
  let changed = false

  if (lua.isIdentifier(expr)) {
    const alias = resolveMinifiedName(expr.text, scope)
    if (alias !== undefined && alias !== expr.text) {
      expr.text = alias
      return true
    }
    return false
  }

  if (lua.isFunctionExpression(expr)) {
    const fnScope = createMinifyScope(scope, blockNames.get(expr.body) ?? new Set())
    for (const param of expr.params ?? []) changed = activateIdentifier(param, fnScope) || changed
    return rewriteBlockNames(expr.body, fnScope, blockNames, false) || changed
  }

  if (lua.isBinaryExpression(expr)) {
    changed = rewriteExpressionNames(expr.left, scope, blockNames) || changed
    changed = rewriteExpressionNames(expr.right, scope, blockNames) || changed
  } else if (lua.isUnaryExpression(expr)) {
    changed = rewriteExpressionNames(expr.operand, scope, blockNames) || changed
  } else if (lua.isParenthesizedExpression(expr)) {
    changed = rewriteExpressionNames(expr.expression, scope, blockNames) || changed
  } else if (lua.isConditionalExpression(expr)) {
    changed = rewriteExpressionNames(expr.condition, scope, blockNames) || changed
    changed = rewriteExpressionNames(expr.whenTrue, scope, blockNames) || changed
    changed = rewriteExpressionNames(expr.whenFalse, scope, blockNames) || changed
  } else if (lua.isCallExpression(expr)) {
    changed = rewriteExpressionNames(expr.expression, scope, blockNames) || changed
    for (const param of expr.params)
      changed = rewriteExpressionNames(param, scope, blockNames) || changed
  } else if (lua.isMethodCallExpression(expr)) {
    changed = rewriteExpressionNames(expr.prefixExpression, scope, blockNames) || changed
    for (const param of expr.params)
      changed = rewriteExpressionNames(param, scope, blockNames) || changed
  } else if (lua.isTableIndexExpression(expr)) {
    changed = rewriteExpressionNames(expr.table, scope, blockNames) || changed
    changed = rewriteExpressionNames(expr.index, scope, blockNames) || changed
  } else if (lua.isTableExpression(expr)) {
    for (const field of expr.fields) {
      changed = rewriteExpressionNames(field.value, scope, blockNames) || changed
      if (field.key) changed = rewriteExpressionNames(field.key, scope, blockNames) || changed
    }
  } else if (lua.isTableFieldExpression(expr)) {
    changed = rewriteExpressionNames(expr.value, scope, blockNames) || changed
    if (expr.key) changed = rewriteExpressionNames(expr.key, scope, blockNames) || changed
  }

  return changed
}

function activateIdentifier(id: lua.Identifier, scope: MinifyScope): boolean {
  const before = id.text
  id.text = activateMinifiedName(id.text, scope)
  return id.text !== before
}

function activateMinifiedName(name: string, scope: MinifyScope): string {
  scope.active.add(name)
  if (
    name === "_" ||
    name.length <= 1 ||
    LUA_RESERVED_NAMES.has(name) ||
    name.startsWith("____exports")
  ) {
    return name
  }

  let alias = scope.aliases.get(name)
  if (alias !== undefined) return alias

  alias = nextMinifiedName(scope)
  scope.aliases.set(name, alias)
  return alias
}

function resolveMinifiedName(name: string, scope: MinifyScope): string | undefined {
  let current: MinifyScope | undefined = scope
  while (current !== undefined) {
    if (current.active.has(name)) return current.aliases.get(name) ?? name
    current = current.parent
  }
  return undefined
}

function nextMinifiedName(scope: MinifyScope): string {
  while (true) {
    const candidate = minifiedNameForIndex(scope.nextName++)
    if (
      LUA_RESERVED_NAMES.has(candidate) ||
      SLUA_GLOBAL_NAMES.has(candidate) ||
      scope.originals.has(candidate) ||
      scope.used.has(candidate)
    ) {
      continue
    }

    scope.used.add(candidate)
    return candidate
  }
}

function minifiedNameForIndex(index: number): string {
  let n = index
  let out = ""
  do {
    out = MINIFY_ALPHABET[n % MINIFY_ALPHABET.length] + out
    n = Math.floor(n / MINIFY_ALPHABET.length) - 1
  } while (n >= 0)
  return out
}
