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
  escapeRegex,
} from "./utils.js"
import { CALL_TRANSFORMS } from "./transforms.js"
import { createOptimizeTransforms, countFilterCalls, ALL_OPTIMIZE } from "./optimize.js"

import type { CallTransform } from "./transforms.js"
import type { OptimizeFlags } from "./optimize.js"

export type { CallTransform, OptimizeFlags }

export interface SluaPluginOptions {
  /** Enable per-transform output optimizations. Pass `true` to enable all. */
  optimize?: boolean | OptimizeFlags
  [key: string]: any
}

function createPlugin(options: SluaPluginOptions = {}): tstl.Plugin {
  const opt: OptimizeFlags = options.optimize === true ? ALL_OPTIMIZE : options.optimize || {}
  const filterSkipFiles = new Set<string>()
  const optTransforms = opt.filter ? createOptimizeTransforms(filterSkipFiles) : []
  const transforms = [...CALL_TRANSFORMS, ...optTransforms]

  const plugin: tstl.Plugin = {
    visitors: {
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

        return context.superTransformStatements(node)
      },

      [ts.SyntaxKind.CallExpression]: (node: ts.CallExpression, context) => {
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
    },

    beforeTransform(program, compilerOptions) {
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

    beforeEmit(program, _options, _emitHost, result) {
      // Strip internal @indexArg / @indexReturn JSDoc tags from Lua comments.
      // These are only consumed by the plugin at transpile time; they should
      // not leak into the output as Lua comments.
      for (const file of result) {
        file.code = file.code
          .replace(/^--\s*@index(?:Arg|Return)\b.*\n/gm, "")
          .replace(/^(---.*)\n(?:-- *\n)+(?=local |ll\.)/gm, "$1\n")
      }

      // Strip empty module boilerplate from files without explicit exports.
      // `moduleDetection: "force"` causes TSTL to wrap every file as a module;
      // standalone SLua scripts don't need the ____exports wrapper.
      for (const file of result) {
        if (!file.code.includes("local ____exports = {}\n")) continue
        if (!file.code.trimEnd().endsWith("return ____exports")) continue

        const hasExplicitExports = file.sourceFiles?.some((sf) =>
          sf.statements.some(
            (s) =>
              ts.isExportDeclaration(s) ||
              ts.isExportAssignment(s) ||
              (ts.canHaveModifiers(s) &&
                ts.getModifiers(s)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)),
          ),
        )

        if (!hasExplicitExports) {
          file.code = file.code
            .replace(/local ____exports = \{\}\n/, "")
            .replace(/\nreturn ____exports\n?$/, "\n")
        }
      }

      // Shorten TSTL destructuring temp names: ____fn_result_N -> _rN
      // Then collapse consecutive field accesses into multi-assignment:
      // local a = _r0.x\nlocal b = _r0.y -> local a, b = _r0.x, _r0.y
      if (opt.shortenTemps) {
        for (const file of result) {
          const seen = new Map<string, string>()
          let counter = 0

          // Collect all unique temp names in order of first occurrence
          for (const match of file.code.matchAll(/____\w+_result_\d+/g)) {
            if (!seen.has(match[0])) {
              seen.set(match[0], `_r${counter++}`)
            }
          }

          // Replace all long names with short aliases in a single pass
          if (seen.size > 0) {
            const combined = new RegExp(`\\b(${[...seen.keys()].join("|")})\\b`, "g")
            file.code = file.code.replace(combined, (m) => seen.get(m) ?? m)
          }

          // Collapse consecutive field accesses from the same temp into multi-assignment
          const lines = file.code.split("\n")
          const collapsed: string[] = []
          let li = 0

          while (li < lines.length) {
            const m = lines[li].match(/^(\s*)local\s+(\w+)\s*=\s*(_r\d+)\.(\w+)\s*$/)

            if (m) {
              const [, indent, name, temp, field] = m
              const names = [name]
              const accesses = [`${temp}.${field}`]
              const nextRe = new RegExp(
                `^${escapeRegex(indent)}local\\s+(\\w+)\\s*=\\s*${temp}\\.(\\w+)\\s*$`,
              )

              while (li + 1 < lines.length) {
                const next = lines[li + 1].match(nextRe)
                if (!next) break
                names.push(next[1])
                accesses.push(`${temp}.${next[2]}`)
                li++
              }

              if (names.length > 1) {
                collapsed.push(`${indent}local ${names.join(", ")} = ${accesses.join(", ")}`)
              } else {
                collapsed.push(lines[li])
              }
            } else {
              collapsed.push(lines[li])
            }
            li++
          }

          file.code = collapsed.join("\n")
        }
      }

      // Merge forward-declared `local x` with its first `x = value` assignment.
      // Only inlines when there are no references to x between declaration and assignment.
      if (opt.inlineLocals) {
        for (const file of result) {
          const lines = file.code.split("\n")
          const removedLines = new Set<number>()

          for (let i = 0; i < lines.length; i++) {
            if (removedLines.has(i)) continue

            // Match forward declaration: `local var1, var2, ...` with no `=`
            const declMatch = lines[i].match(/^(\s*)local\s+((?:\w+(?:,\s*)*)*\w+)\s*$/)
            if (!declMatch) continue

            const indent = declMatch[1]
            const escapedIndent = escapeRegex(indent)
            const vars = declMatch[2]
              .split(/,\s*/)
              .map((v) => v.trim())
              .filter(Boolean)
            const inlined = new Set<string>()

            for (const varName of vars) {
              // Hoist regex compilation outside inner loop; negative lookahead
              // rejects multi-variable assignment lines like `a, b = fn()`
              const assignRe = new RegExp(`^${escapedIndent}${varName}(?!\\s*,)\\s*=\\s*(.+)$`)
              const refRe = new RegExp(`\\b${varName}\\b`)

              for (let j = i + 1; j < lines.length; j++) {
                if (removedLines.has(j)) continue

                // Check for bare single-variable assignment at same indentation
                const assignMatch = lines[j].match(assignRe)

                if (assignMatch) {
                  // Don't inline if RHS references the variable (self-referencing)
                  if (refRe.test(assignMatch[1])) break
                  lines[j] = `${indent}local ${varName} = ${assignMatch[1]}`
                  inlined.add(varName)
                  break
                }

                // Reference to varName prevents inlining
                if (refRe.test(lines[j])) break
              }
            }

            if (inlined.size === 0) continue

            const remaining = vars.filter((v) => !inlined.has(v))
            if (remaining.length === 0) {
              removedLines.add(i)
            } else {
              lines[i] = `${indent}local ${remaining.join(", ")}`
            }
          }

          file.code = lines.filter((_, idx) => !removedLines.has(idx)).join("\n")
        }
      }
    },

    // Compound assignment runs in afterEmit so it applies after other plugins
    // that may also post-process the Lua source in beforeEmit.
    // `+=` is Luau-only syntax and would be garbled by Lua 5.1 parsers.
    afterEmit(_program, _options, emitHost, result) {
      if (!opt.compoundAssignment) return

      for (const file of result) {
        file.code = file.code.replace(
          /^(\s*)(\w+) = \2 (\/\/|\.\.|[+\-*/%^]) (\S+)(\s*(?:--.*)?)$/gm,
          "$1$2 $3= $4$5",
        )

        if (emitHost.writeFile) {
          emitHost.writeFile(file.outputPath, file.code, false)
        }
      }
    },
  }

  return plugin
}

export default createPlugin
