import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import { isMethodCall, isArrayType } from "./utils.js"
import type { CallTransform } from "./transforms.js"

export interface OptimizeFlags {
  /** Inline `.filter()` calls as `for` loops with `ipairs`. Default: false */
  filter?: boolean
  /** Rewrite `x = x + n` to `x += n` (Luau compound assignment). Default: false */
  compoundAssignment?: boolean
  /** Reorder `Math.floor((a / b) * c)` to `a * c // b`. */
  floorMultiply?: boolean
  /** Emit bare `string.find`/`table.find` for indexOf presence checks. */
  indexOf?: boolean
  /** Shorten TSTL destructuring temp names (`____fn_result_N` -> `_rN`). */
  shortenTemps?: boolean
  /** Merge forward-declared `local x` with its first `x = value` assignment. */
  inlineLocals?: boolean
  /** Strip `tostring()` from number-typed template literal interpolations. */
  numericConcat?: boolean
  /** Collapse `if x == nil then x = <literal> end` to `x = x or <literal>`. */
  defaultParams?: boolean
}

export const ALL_OPTIMIZE: Required<OptimizeFlags> = {
  filter: true,
  compoundAssignment: true,
  floorMultiply: true,
  indexOf: true,
  shortenTemps: true,
  inlineLocals: true,
  numericConcat: true,
  defaultParams: true,
}

/**
 * Count `arr.filter(cb)` calls and return a set of file names where inlining
 * should be skipped (the shared `__TS__ArrayFilter` helper is smaller).
 *
 * When `bundle` is true (luaBundle mode), all source files end up in a single
 * output, so the total across the program is what matters.  Otherwise each
 * file is counted independently.
 */
export function countFilterCalls(program: ts.Program, bundle: boolean): Set<string> {
  const skip = new Set<string>()
  const checker = program.getTypeChecker()
  const sourceFiles = program.getSourceFiles().filter((sf) => !sf.isDeclarationFile)

  if (bundle) {
    let total = 0

    for (const sf of sourceFiles) {
      ts.forEachChild(sf, function visit(node) {
        if (isArrayFilterCall(node, checker)) total++
        ts.forEachChild(node, visit)
      })
    }

    if (total > 1) {
      for (const sf of sourceFiles) {
        skip.add(sf.fileName)
      }
    }
  } else {
    for (const sf of sourceFiles) {
      let count = 0

      ts.forEachChild(sf, function visit(node) {
        if (isArrayFilterCall(node, checker)) count++
        ts.forEachChild(node, visit)
      })

      if (count > 1) {
        skip.add(sf.fileName)
      }
    }
  }

  return skip
}

function isArrayFilterCall(node: ts.Node, checker: ts.TypeChecker): boolean {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === "filter" &&
    node.arguments.length === 1 &&
    isArrayType(node.expression.expression, checker)
  )
}

export function createOptimizeTransforms(filterSkipFiles: Set<string>): CallTransform[] {
  let counter = 0

  return [
    // arr.filter(cb) -> inline for loop with ipairs
    {
      match: (node, checker) => {
        if (filterSkipFiles.has(node.getSourceFile().fileName)) return false
        return isMethodCall(node, checker, isArrayType, "filter", 1)
      },
      emit: (node, context) => {
        const n = counter++
        const resultId = tstl.createIdentifier(`____opt_${n}`)
        const valueId = tstl.createIdentifier(`____opt_v_${n}`)
        const cbId = tstl.createIdentifier(`____opt_fn_${n}`)

        const arr = context.transformExpression(
          (node.expression as ts.PropertyAccessExpression).expression,
        )
        const cb = context.transformExpression(node.arguments[0])

        // Strip TSTL's context parameter (____) from the callback if present.
        // Array callbacks are always called positionally; the context param is dead.
        if (
          tstl.isFunctionExpression(cb) &&
          cb.params &&
          cb.params.length > 0 &&
          cb.params[0].text === "____"
        ) {
          cb.params = cb.params.slice(1)
        }

        // local ____opt_fn_N = <callback>
        context.addPrecedingStatements(tstl.createVariableDeclarationStatement(cbId, cb, node))

        // local ____opt_N = {}
        context.addPrecedingStatements(
          tstl.createVariableDeclarationStatement(
            tstl.cloneIdentifier(resultId),
            tstl.createTableExpression(),
            node,
          ),
        )

        // ____opt_fn_N(____opt_v_N)
        const filterCall = tstl.createCallExpression(tstl.cloneIdentifier(cbId), [
          tstl.cloneIdentifier(valueId),
        ])

        // ____opt_N[#____opt_N + 1] = ____opt_v_N
        const appendStmt = tstl.createAssignmentStatement(
          tstl.createTableIndexExpression(
            tstl.cloneIdentifier(resultId),
            tstl.createBinaryExpression(
              tstl.createUnaryExpression(
                tstl.cloneIdentifier(resultId),
                tstl.SyntaxKind.LengthOperator,
              ),
              tstl.createNumericLiteral(1),
              tstl.SyntaxKind.AdditionOperator,
            ),
          ),
          tstl.cloneIdentifier(valueId),
        )

        // if ____opt_fn_N(____opt_v_N) then ... end
        const ifStmt = tstl.createIfStatement(filterCall, tstl.createBlock([appendStmt]))

        // for _, ____opt_v_N in ipairs(arr) do ... end
        context.addPrecedingStatements(
          tstl.createForInStatement(
            tstl.createBlock([ifStmt]),
            [tstl.createIdentifier("_"), valueId],
            [tstl.createCallExpression(tstl.createIdentifier("ipairs"), [arr])],
            node,
          ),
        )

        return tstl.cloneIdentifier(resultId)
      },
    },
  ]
}
