import * as ts from "typescript"
import * as lua from "typescript-to-lua"
import { walkBlocks, walkIdentifiers, containsIdentifier } from "./lua-ast-walk.js"

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
 * Shorten TSTL destructuring temp names: ____*_result_* -> _rN.
 * Two-pass: collect unique names in order, then rename all identifiers.
 */
export function shortenTempNames(file: lua.File): boolean {
  const seen = new Map<string, string>()
  let counter = 0
  const tempRe = /^____\w+_result_\d+$/

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
