import * as ts from "typescript"
import * as tstl from "typescript-to-lua"

/**
 * PascalCase class names that map to lowercase Lua globals.
 * `new Vector(...)` is handled by @customConstructor, but static access
 * like `Vector.zero` emits `Vector.zero` in Lua -- which doesn't exist.
 * The PropertyAccessExpression visitor rewrites the Lua identifier to lowercase.
 */
const PASCAL_TO_LOWER: Record<string, string> = {
  Vector: "vector",
  Quaternion: "quaternion",
  UUID: "uuid",
}

/**
 * TSTL treats "bit32" as a Lua keyword and renames it to "____bit32" in output.
 * This is incorrect for Luau where bit32 is a valid global library.
 * The visitor rewrites the mangled name back; the diagnostic is suppressed
 * separately in consumers (e.g. the playground transpiler worker).
 */
const TSTL_KEYWORD_FIXUPS: Record<string, string> = {
  ____bit32: "bit32",
}

/**
 * Creates a `bit32.<fn>(...args)` Lua call expression.
 * The optional `node` attaches TypeScript source-map information; when
 * patching already-lowered Lua AST nodes (e.g. from compound-assignment
 * desugaring) there is no originating TS node, so it may be omitted.
 */
function createBit32Call(fn: string, args: tstl.Expression[], node?: ts.Node): tstl.CallExpression {
  return tstl.createCallExpression(
    tstl.createTableIndexExpression(tstl.createIdentifier("bit32"), tstl.createStringLiteral(fn)),
    args,
    node,
  )
}

const BINARY_BITWISE_OPS: Record<number, string> = {
  [ts.SyntaxKind.AmpersandToken]: "band",
  [ts.SyntaxKind.BarToken]: "bor",
  [ts.SyntaxKind.CaretToken]: "bxor",
  [ts.SyntaxKind.LessThanLessThanToken]: "lshift",
  [ts.SyntaxKind.GreaterThanGreaterThanToken]: "arshift",
  [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken]: "rshift",
}

/**
 * Compound bitwise assignment tokens (`&=`, `|=`, etc.) map to the same
 * `bit32.*` functions as their non-compound counterparts.  We handle
 * these at the TypeScript AST level rather than patching the Lua AST,
 * because TSTL's desugaring loses the distinction between `>>=`
 * (arshift) and `>>>=` (rshift) -- both lower to the same Lua operator.
 */
const COMPOUND_BITWISE_OPS: Record<number, string> = {
  [ts.SyntaxKind.AmpersandEqualsToken]: "band",
  [ts.SyntaxKind.BarEqualsToken]: "bor",
  [ts.SyntaxKind.CaretEqualsToken]: "bxor",
  [ts.SyntaxKind.LessThanLessThanEqualsToken]: "lshift",
  [ts.SyntaxKind.GreaterThanGreaterThanEqualsToken]: "arshift",
  [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken]: "rshift",
}

/**
 * Returns true when `node` is `Math.floor(<single-arg>)`.
 */
function isMathFloor(node: ts.CallExpression): node is ts.CallExpression & { arguments: [ts.Expression] } {
  return (
    node.arguments.length === 1 &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    node.expression.expression.text === "Math" &&
    node.expression.name.text === "floor"
  )
}

const EQUALITY_OPS = new Set([
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
])

function isZeroLiteral(node: ts.Expression): boolean {
  return ts.isNumericLiteral(node) && node.text === "0"
}

function isNegatedEquality(op: ts.SyntaxKind): boolean {
  return (
    op === ts.SyntaxKind.ExclamationEqualsToken || op === ts.SyntaxKind.ExclamationEqualsEqualsToken
  )
}

/**
 * Detect `(a & b) !== 0`, `0 === (a & b)`, etc. and return the `&` expression
 * plus whether to negate the btest result.
 */
function extractBtestPattern(
  node: ts.BinaryExpression,
): { band: ts.BinaryExpression; negate: boolean } | null {
  const op = node.operatorToken.kind
  if (!EQUALITY_OPS.has(op)) return null

  let bandExpr: ts.Expression

  if (isZeroLiteral(node.right)) {
    bandExpr = ts.isParenthesizedExpression(node.left) ? node.left.expression : node.left
  } else if (isZeroLiteral(node.left)) {
    bandExpr = ts.isParenthesizedExpression(node.right) ? node.right.expression : node.right
  } else {
    return null
  }

  if (
    !ts.isBinaryExpression(bandExpr) ||
    bandExpr.operatorToken.kind !== ts.SyntaxKind.AmpersandToken
  ) {
    return null
  }

  // `== 0` / `=== 0` mean "no bits in common", so we negate btest (negate = true).
  // `!= 0` / `!== 0` mean "some bits in common", which is what btest returns
  // directly, so no negation is needed.  The `!isNegatedEquality` double-negative
  // captures this: negated equality (!=) → false → don't negate btest.
  return { band: bandExpr, negate: !isNegatedEquality(op) }
}

const plugin: tstl.Plugin = {
  visitors: {
    [ts.SyntaxKind.PropertyAccessExpression]: (node: ts.PropertyAccessExpression, context) => {
      const result = context.superTransformExpression(node)

      // Rewrite identifiers in the Lua AST (PascalCase → lowercase, TSTL keyword fixups).
      if (tstl.isTableIndexExpression(result) && tstl.isIdentifier(result.table)) {
        const replacement =
          PASCAL_TO_LOWER[result.table.text] ?? TSTL_KEYWORD_FIXUPS[result.table.text]

        if (replacement) {
          result.table.text = replacement
        }
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
        const left = context.transformExpression(node.left) as tstl.AssignmentLeftHandSideExpression
        const right = context.transformExpression(node.right)
        const call = createBit32Call(compoundFn, [left, right], node)
        context.addPrecedingStatements(tstl.createAssignmentStatement(left, call, node))
        return left
      }

      return context.superTransformExpression(node)
    },

    // Compound bitwise assignments used as statements (`a &= 3;`) are handled
    // by TSTL's ExpressionStatement → transformBinaryExpressionStatement path,
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
      }

      return context.superTransformStatements(node)
    },

    [ts.SyntaxKind.CallExpression]: (node: ts.CallExpression, context) => {
      // `Math.floor(a / b)` → `a // b` (native Luau floor division operator)
      if (isMathFloor(node)) {
        const arg = node.arguments[0]
        if (ts.isBinaryExpression(arg) && arg.operatorToken.kind === ts.SyntaxKind.SlashToken) {
          const left = context.transformExpression(arg.left)
          const right = context.transformExpression(arg.right)
          return tstl.createBinaryExpression(left, right, tstl.SyntaxKind.FloorDivisionOperator, node)
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
  },

  beforeTransform(_program, options) {
    const diagnostics: ts.Diagnostic[] = []

    if (options.luaTarget !== tstl.LuaTarget.Luau) {
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

    if (
      options.luaLibImport !== undefined &&
      ![tstl.LuaLibImportKind.None, tstl.LuaLibImportKind.Inline].includes(options.luaLibImport)
    ) {
      diagnostics.push({
        file: undefined,
        start: undefined,
        length: undefined,
        messageText: '@gwigz/slua-tstl-plugin requires luaLibImport to be "none" or "inline"',
        category: ts.DiagnosticCategory.Warning,
        code: 90002,
        source: "@gwigz/slua-tstl-plugin",
      })
    }

    return diagnostics
  },
}

export default plugin
