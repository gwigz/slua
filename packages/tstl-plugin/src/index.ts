import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import {
  PASCAL_TO_LOWER,
  TSTL_KEYWORD_FIXUPS,
  BINARY_BITWISE_OPS,
  COMPOUND_BITWISE_OPS,
} from "./constants.js"
import {
  createBit32Call,
  isMathFloor,
  isStringOrNumberLike,
  extractBtestPattern,
  extractIndexOfPresence,
  extractConcatSelfAssignment,
  extractSpreadSelfAssignment,
  emitChainedExtend,
  getLLIndexSemantics,
  emitLLIndexCall,
  isDetectedEventIndex,
  createNamespacedCall,
  createStringFindCall,
} from "./utils.js"
import { CALL_TRANSFORMS } from "./transforms.js"
import { matchBuilderChain, emitBuilderChain } from "./builder-transform.js"
import { matchOptionsCall, emitOptionsCall } from "./options-transform.js"
import { tryFoldBitwise } from "./fold-bitwise.js"
import { createOptimizeTransforms, countFilterCalls, ALL_OPTIMIZE } from "./optimize.js"
import { tryEvaluateCondition, shouldStripDefineGuard } from "./define.js"
import {
  stripInternalJSDocTags,
  stripEmptyModuleBoilerplate,
  collapseDefaultParamNilChecks,
  shortenTempNames,
  collapseFieldAccesses,
  inlineForwardDeclarations,
} from "./lua-transforms.js"

import type { ProcessedFile } from "typescript-to-lua"
import type { CallTransform } from "./transforms.js"
import type { OptimizeFlags } from "./optimize.js"
import type { DefineMap } from "./define.js"

export type { CallTransform, OptimizeFlags, DefineMap }

export interface SluaPluginOptions {
  /** Enable per-transform output optimizations. Pass `true` to enable all. */
  optimize?: boolean | OptimizeFlags
  /** Compile-time defines for dead code elimination. */
  define?: Record<string, boolean | number | string>
  [key: string]: any
}

function createPlugin(options: SluaPluginOptions = {}): tstl.Plugin {
  const opt: OptimizeFlags = options.optimize === true ? ALL_OPTIMIZE : options.optimize || {}
  const filterSkipFiles = new Set<string>()
  const optTransforms = opt.filter ? createOptimizeTransforms(filterSkipFiles) : []
  const transforms = [...CALL_TRANSFORMS, ...optTransforms]
  const defineMap: DefineMap = new Map(options.define ? Object.entries(options.define) : [])
  const foldedBitwiseComments = new Map<string, { value: number; source: string }[]>()

  function recordFoldedComment(fileName: string, folded: { value: number; source: string }) {
    const arr = foldedBitwiseComments.get(fileName)
    if (arr) arr.push(folded)
    else foldedBitwiseComments.set(fileName, [folded])
  }

  const plugin: tstl.Plugin = {
    visitors: {
      [ts.SyntaxKind.Identifier]:
        defineMap.size > 0
          ? (node: ts.Identifier, context) => {
              const value = defineMap.get(node.text)
              if (value === undefined) return context.superTransformExpression(node)

              // Don't replace if this identifier is:
              // - A property name in a property access (obj.CONFIG_X)
              // - A declaration name (const CONFIG_X = ...)
              // - A parameter name
              // - A property assignment name ({ CONFIG_X: ... })
              // - A shorthand property assignment name ({ CONFIG_X })
              const parent = node.parent

              if (ts.isPropertyAccessExpression(parent) && parent.name === node) {
                return context.superTransformExpression(node)
              }

              if (
                (ts.isVariableDeclaration(parent) ||
                  ts.isFunctionDeclaration(parent) ||
                  ts.isParameter(parent) ||
                  ts.isEnumMember(parent)) &&
                parent.name === node
              ) {
                return context.superTransformExpression(node)
              }

              if (ts.isPropertyAssignment(parent) && parent.name === node) {
                return context.superTransformExpression(node)
              }

              if (ts.isShorthandPropertyAssignment(parent) && parent.name === node) {
                return context.superTransformExpression(node)
              }

              if (typeof value === "boolean") {
                return tstl.createBooleanLiteral(value, node)
              }

              if (typeof value === "number") {
                return tstl.createNumericLiteral(value, node)
              }

              return tstl.createStringLiteral(value, node)
            }
          : undefined,

      [ts.SyntaxKind.IfStatement]:
        defineMap.size > 0
          ? (node: ts.IfStatement, context) => {
              const result = tryEvaluateCondition(node.expression, defineMap)

              if (result === undefined) {
                return context.superTransformStatements(node)
              }

              if (result) {
                const stmts = ts.isBlock(node.thenStatement)
                  ? [...node.thenStatement.statements]
                  : [node.thenStatement]
                return stmts.flatMap((s) => context.transformStatements(s))
              }

              if (node.elseStatement) {
                const stmts = ts.isBlock(node.elseStatement)
                  ? [...node.elseStatement.statements]
                  : [node.elseStatement]
                return stmts.flatMap((s) => context.transformStatements(s))
              }

              return []
            }
          : undefined,

      [ts.SyntaxKind.FunctionDeclaration]:
        defineMap.size > 0
          ? (node: ts.FunctionDeclaration, context) => {
              if (shouldStripDefineGuard(node, defineMap)) return []
              return context.superTransformStatements(node)
            }
          : undefined,

      [ts.SyntaxKind.VariableStatement]:
        defineMap.size > 0
          ? (node: ts.VariableStatement, context) => {
              if (shouldStripDefineGuard(node, defineMap)) return []
              return context.superTransformStatements(node)
            }
          : undefined,

      [ts.SyntaxKind.PropertyAccessExpression]: (node: ts.PropertyAccessExpression, context) => {
        const result = context.superTransformExpression(node)

        // Rewrite identifiers in the Lua AST (PascalCase -> lowercase, TSTL keyword fixups).
        if (tstl.isTableIndexExpression(result) && tstl.isIdentifier(result.table)) {
          const replacement =
            PASCAL_TO_LOWER[result.table.text] ?? TSTL_KEYWORD_FIXUPS[result.table.text]

          if (replacement) {
            result.table.text = replacement
          }
        }

        // DetectedEvent.index is 1-based at runtime in SLua; emit `obj.index - 1`
        // so TypeScript sees a 0-based value. This composes correctly with
        // @indexArg functions (which add +1, cancelling out the -1).
        if (isDetectedEventIndex(node, context.checker)) {
          return tstl.createBinaryExpression(
            result,
            tstl.createNumericLiteral(1),
            tstl.SyntaxKind.SubtractionOperator,
            node,
          )
        }

        return result
      },

      [ts.SyntaxKind.BinaryExpression]: (node: ts.BinaryExpression, context) => {
        // Check for btest pattern: (a & b) !== 0, 0 === (a & b), etc.
        const btest = extractBtestPattern(node)

        if (btest) {
          const left = context.transformExpression(btest.band.left)
          const right = context.transformExpression(btest.band.right)
          const call = createBit32Call("btest", [left, right], node)

          return btest.negate
            ? tstl.createUnaryExpression(call, tstl.SyntaxKind.NotOperator, node)
            : call
        }

        // indexOf presence check: s.indexOf(x) >= 0 -> string.find(s, x, 1, true)
        if (opt.indexOf) {
          const presence = extractIndexOfPresence(node, context.checker)

          if (presence) {
            const callExpr = presence.call.expression as ts.PropertyAccessExpression
            const receiver = context.transformExpression(callExpr.expression)
            const arg = context.transformExpression(presence.call.arguments[0])

            const findCall = presence.isString
              ? createStringFindCall(receiver, arg, node)
              : createNamespacedCall("table", "find", [receiver, arg], node)

            return presence.negate
              ? tstl.createUnaryExpression(findCall, tstl.SyntaxKind.NotOperator, node)
              : findCall
          }
        }

        const op = node.operatorToken.kind
        const fn = BINARY_BITWISE_OPS[op]

        if (fn && opt.foldBitwise) {
          const folded = tryFoldBitwise(node, context.checker)

          if (folded) {
            recordFoldedComment(node.getSourceFile().fileName, folded)
            return tstl.createNumericLiteral(folded.value, node)
          }
        }

        if (fn) {
          const left = context.transformExpression(node.left)
          const right = context.transformExpression(node.right)

          return createBit32Call(fn, [left, right], node)
        }

        // Compound bitwise assignments (`&=`, `|=`, `^=`, `<<=`, `>>=`, `>>>=`).
        // Manually desugar to `lhs = bit32.<fn>(lhs, rhs)` so we preserve the
        // correct function (especially arshift vs rshift).  This path is only
        // reached when a compound assignment is used as an *expression*; the
        // statement case is handled by the ExpressionStatement visitor below.
        const compoundFn = COMPOUND_BITWISE_OPS[op]
        if (compoundFn) {
          const left = context.transformExpression(
            node.left,
          ) as tstl.AssignmentLeftHandSideExpression
          const right = context.transformExpression(node.right)
          const call = createBit32Call(compoundFn, [left, right], node)

          context.addPrecedingStatements(tstl.createAssignmentStatement(left, call, node))

          return left
        }

        return context.superTransformExpression(node)
      },

      // Compound bitwise assignments used as statements (`a &= 3;`) are handled
      // by TSTL's ExpressionStatement -> transformBinaryExpressionStatement path,
      // which never calls the BinaryExpression visitor.  We intercept here and
      // manually desugar to `lhs = bit32.<fn>(lhs, rhs)` to preserve the correct
      // function name (especially arshift vs rshift which TSTL conflates).
      [ts.SyntaxKind.ExpressionStatement]: (node: ts.ExpressionStatement, context) => {
        if (ts.isBinaryExpression(node.expression)) {
          const compoundFn = COMPOUND_BITWISE_OPS[node.expression.operatorToken.kind]

          if (compoundFn) {
            const left = context.transformExpression(
              node.expression.left,
            ) as tstl.AssignmentLeftHandSideExpression

            const right = context.transformExpression(node.expression.right)
            const call = createBit32Call(compoundFn, [left, right], node)

            return [tstl.createAssignmentStatement(left, call, node)]
          }

          // Self-reassignment concat/spread -> table.extend (in-place, no assignment needed)
          const concatMatch =
            extractConcatSelfAssignment(node.expression, context.checker) ??
            extractSpreadSelfAssignment(node.expression, context.checker)

          if (concatMatch) {
            const target = context.transformExpression(concatMatch.name)
            const args = concatMatch.args.map((a) => context.transformExpression(a)) as [
              tstl.Expression,
              ...tstl.Expression[],
            ]

            const call = emitChainedExtend(target, args, node)

            return [tstl.createExpressionStatement(call, node)]
          }
        }

        // Builder chain detection (e.g. $setPrimParams(LINK_THIS).color(0, v, 1))
        if (ts.isCallExpression(node.expression)) {
          const chain = matchBuilderChain(node.expression)
          if (chain) {
            return [emitBuilderChain(chain, context, node)]
          }
        }

        return context.superTransformStatements(node)
      },

      [ts.SyntaxKind.CallExpression]: (node: ts.CallExpression, context) => {
        // Options-object pattern (e.g. $castRay(start, end, { maxHits: 4 }))
        const optionsMatch = matchOptionsCall(node)
        if (optionsMatch) {
          return emitOptionsCall(optionsMatch, context, node)
        }

        // Catalog-driven transforms
        for (const transform of transforms) {
          if (transform.match(node, context.checker)) {
            return transform.emit(node, context)
          }
        }

        // ll.* index-semantics: automatic 0->1 index adjustment
        const indexSemantics = getLLIndexSemantics(node, context.checker)

        if (indexSemantics) {
          return emitLLIndexCall(node, context, indexSemantics)
        }

        // `Math.floor(a / b)` -> `a // b` (native Luau floor division operator)
        if (isMathFloor(node)) {
          const arg = node.arguments[0]

          if (ts.isBinaryExpression(arg) && arg.operatorToken.kind === ts.SyntaxKind.SlashToken) {
            const left = context.transformExpression(arg.left)
            const right = context.transformExpression(arg.right)

            return tstl.createBinaryExpression(
              left,
              right,
              tstl.SyntaxKind.FloorDivisionOperator,
              node,
            )
          }

          // `Math.floor((a / b) * c)` -> `a * c // b`
          // Reorders multiplication around a division to use floor division.
          // Mathematically equivalent for reals; may differ by ±1 at exact
          // integer boundaries due to floating-point rounding reorder.
          if (
            opt.floorMultiply &&
            ts.isBinaryExpression(arg) &&
            arg.operatorToken.kind === ts.SyntaxKind.AsteriskToken
          ) {
            const leftUn = ts.isParenthesizedExpression(arg.left) ? arg.left.expression : arg.left
            const rightUn = ts.isParenthesizedExpression(arg.right)
              ? arg.right.expression
              : arg.right

            let div: ts.BinaryExpression | null = null
            let mult: ts.Expression | null = null

            if (
              ts.isBinaryExpression(leftUn) &&
              leftUn.operatorToken.kind === ts.SyntaxKind.SlashToken
            ) {
              div = leftUn
              mult = arg.right
            } else if (
              ts.isBinaryExpression(rightUn) &&
              rightUn.operatorToken.kind === ts.SyntaxKind.SlashToken
            ) {
              div = rightUn
              mult = arg.left
            }

            if (div && mult) {
              const dividend = context.transformExpression(div.left)
              const divisor = context.transformExpression(div.right)
              const multiplier = context.transformExpression(mult)

              // a * c // b  (same precedence, left-associative -> (a * c) // b)
              return tstl.createBinaryExpression(
                tstl.createBinaryExpression(
                  dividend,
                  multiplier,
                  tstl.SyntaxKind.MultiplicationOperator,
                  node,
                ),
                divisor,
                tstl.SyntaxKind.FloorDivisionOperator,
                node,
              )
            }
          }
        }

        return context.superTransformExpression(node)
      },

      [ts.SyntaxKind.PrefixUnaryExpression]: (node: ts.PrefixUnaryExpression, context) => {
        if (node.operator === ts.SyntaxKind.TildeToken && opt.foldBitwise) {
          const folded = tryFoldBitwise(node, context.checker)

          if (folded) {
            recordFoldedComment(node.getSourceFile().fileName, folded)
            return tstl.createNumericLiteral(folded.value, node)
          }
        }

        if (node.operator === ts.SyntaxKind.TildeToken) {
          const operand = context.transformExpression(node.operand)
          return createBit32Call("bnot", [operand], node)
        }

        return context.superTransformExpression(node)
      },

      [ts.SyntaxKind.TemplateExpression]: (node: ts.TemplateExpression, context) => {
        if (!opt.numericConcat) {
          return context.superTransformExpression(node)
        }

        const parts: tstl.Expression[] = []

        const head = node.head.text
        if (head.length > 0) {
          parts.push(tstl.createStringLiteral(head, node.head))
        }

        for (const span of node.templateSpans) {
          const expr = context.transformExpression(span.expression)

          if (isStringOrNumberLike(context.checker, span.expression)) {
            parts.push(expr)
          } else {
            parts.push(
              tstl.createCallExpression(tstl.createIdentifier("tostring"), [expr], span.expression),
            )
          }

          const text = span.literal.text
          if (text.length > 0) {
            parts.push(tstl.createStringLiteral(text, span.literal))
          }
        }

        return parts.reduce((prev, current) =>
          tstl.createBinaryExpression(prev, current, tstl.SyntaxKind.ConcatOperator),
        )
      },

      // Collapse `() => fn()` to just `fn` when fn has zero parameters.
      // Extra args from the caller are harmlessly ignored by zero-param functions.
      [ts.SyntaxKind.ArrowFunction]: (node: ts.ArrowFunction, context) => {
        if (node.parameters.length === 0) {
          let callExpr: ts.CallExpression | undefined

          if (ts.isCallExpression(node.body)) {
            callExpr = node.body
          } else if (ts.isBlock(node.body) && node.body.statements.length === 1) {
            const stmt = node.body.statements[0]

            if (ts.isExpressionStatement(stmt) && ts.isCallExpression(stmt.expression)) {
              callExpr = stmt.expression
            } else if (
              ts.isReturnStatement(stmt) &&
              stmt.expression &&
              ts.isCallExpression(stmt.expression)
            ) {
              callExpr = stmt.expression
            }
          }

          if (callExpr && callExpr.arguments.length === 0 && ts.isIdentifier(callExpr.expression)) {
            const type = context.checker.getTypeAtLocation(callExpr.expression)
            const sigs = type.getCallSignatures()

            if (sigs.length > 0 && sigs.every((s) => s.parameters.length === 0)) {
              return context.transformExpression(callExpr.expression)
            }
          }
        }

        return context.superTransformExpression(node)
      },
    },

    beforeTransform(program, compilerOptions) {
      foldedBitwiseComments.clear()
      const diagnostics: ts.Diagnostic[] = []

      if (compilerOptions.luaTarget !== tstl.LuaTarget.Luau) {
        diagnostics.push({
          file: undefined,
          start: undefined,
          length: undefined,
          messageText:
            '@gwigz/slua-tstl-plugin requires luaTarget to be "Luau", set "luaTarget": "Luau" in tsconfig.json',
          category: ts.DiagnosticCategory.Error,
          code: 90000,
          source: "@gwigz/slua-tstl-plugin",
        })
      }

      // Pre-scan: skip filter inlining for files with multiple .filter() calls
      // (the shared __TS__ArrayFilter helper is smaller than 2+ inlined loops).
      // In luaBundle mode, all files end up in one output so we count globally.
      if (opt.filter) {
        const bundle = !!(options as tstl.CompilerOptions).luaBundle
        const skip = countFilterCalls(program, bundle)

        filterSkipFiles.clear()

        for (const f of skip) {
          filterSkipFiles.add(f)
        }
      }

      return diagnostics
    },

    afterPrint(program, _options, emitHost, result: ProcessedFile[]) {
      for (const file of result) {
        if (!file.luaAst) continue
        let dirty = false

        // Always-on transforms
        dirty = stripInternalJSDocTags(file.luaAst) || dirty
        dirty = stripEmptyModuleBoilerplate(file.luaAst, file.sourceFiles) || dirty

        // Opt-in transforms
        if (opt.defaultParams) dirty = collapseDefaultParamNilChecks(file.luaAst) || dirty

        if (opt.shortenTemps) {
          dirty = shortenTempNames(file.luaAst) || dirty
          dirty = collapseFieldAccesses(file.luaAst) || dirty
        }

        if (opt.inlineLocals) dirty = inlineForwardDeclarations(file.luaAst) || dirty

        // Re-print if AST was modified
        if (dirty) {
          const printer = new tstl.LuaPrinter(emitHost, program, file.fileName)
          const printed = printer.print(file.luaAst)

          file.code = printed.code
          file.sourceMap = printed.sourceMap
          file.sourceMapNode = printed.sourceMapNode
        }

        // String-level post-processing (no Lua AST node for these constructs).
        // When any string replacement fires, we must clear sourceMapNode so that
        // the bundle assembler uses the modified `code` instead of the stale
        // source-map tree.
        let codeDirty = false

        // Compound assignment stays as regex (no Lua AST node for +=)
        if (opt.compoundAssignment) {
          const before = file.code
          file.code = file.code.replace(
            /^(\s*)(\w+) = \2 (\/\/|\.\.|[+\-*/%^]) (\S+)(\s*(?:--.*)?)$/gm,
            "$1$2 $3= $4$5",
          )
          if (file.code !== before) codeDirty = true
        }

        // Inject inline comments for folded bitwise constants
        if (opt.foldBitwise && file.sourceFiles) {
          for (const sf of file.sourceFiles) {
            const entries = foldedBitwiseComments.get(sf.fileName)
            if (!entries) continue

            for (const { value, source } of entries) {
              if (/[|&^~<>]/.test(source)) {
                const numStr = String(value)
                const before = file.code
                // Replace first occurrence of the bare folded number (not already commented)
                file.code = file.code.replace(
                  new RegExp(`(?<=\\W)${numStr}(?=\\W)(?!.*--)`, "m"),
                  `${numStr} --[[ ${source} ]]`,
                )
                if (file.code !== before) codeDirty = true
              }
            }

            foldedBitwiseComments.delete(sf.fileName)
          }
        }

        // Force bundle assembler to use modified code string
        if (codeDirty) {
          file.sourceMapNode = undefined as any
        }
      }
    },
  }

  return plugin
}

export default createPlugin
