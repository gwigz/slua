import * as ts from "typescript"

const BITWISE_JS_OPS: Record<number, (a: number, b: number) => number> = {
  [ts.SyntaxKind.BarToken]: (a, b) => (a | b) >>> 0,
  [ts.SyntaxKind.AmpersandToken]: (a, b) => (a & b) >>> 0,
  [ts.SyntaxKind.CaretToken]: (a, b) => (a ^ b) >>> 0,
  [ts.SyntaxKind.LessThanLessThanToken]: (a, b) => (a << b) >>> 0,
  [ts.SyntaxKind.GreaterThanGreaterThanToken]: (a, b) => (a >> b) >>> 0,
  [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken]: (a, b) => a >>> b,
}

/**
 * Recursively evaluate a bitwise expression tree where every leaf is a
 * numeric literal or a constant identifier with a numeric literal type.
 * Returns the computed unsigned-32-bit value, or `null` if any operand
 * is non-constant.
 */
function evaluate(node: ts.Expression, checker: ts.TypeChecker | undefined): number | null {
  // Unwrap parentheses and type assertions: (expr), expr as T, <T>expr
  if (ts.isParenthesizedExpression(node)) return evaluate(node.expression, checker)
  if (ts.isAsExpression(node)) return evaluate(node.expression, checker)
  if (ts.isTypeAssertionExpression(node)) return evaluate(node.expression, checker)
  // TS 5.x satisfies expression
  if (ts.isSatisfiesExpression?.(node)) return evaluate((node as any).expression, checker)

  // Numeric literal
  if (ts.isNumericLiteral(node)) return Number(node.text)

  // Identifier — resolve via the type checker to a numeric literal type
  if (ts.isIdentifier(node) && checker) {
    const type = checker.getTypeAtLocation(node)

    if (type.isNumberLiteral()) {
      return type.value
    }

    return null
  }

  // Unary prefix: ~ and - (for negative literals)
  if (ts.isPrefixUnaryExpression(node)) {
    if (node.operator === ts.SyntaxKind.TildeToken) {
      const val = evaluate(node.operand, checker)
      return val === null ? null : ~val >>> 0
    }

    if (node.operator === ts.SyntaxKind.MinusToken) {
      const val = evaluate(node.operand, checker)
      return val === null ? null : -val
    }

    return null
  }

  // Binary bitwise expression
  if (ts.isBinaryExpression(node)) {
    const op = BITWISE_JS_OPS[node.operatorToken.kind]
    if (!op) return null

    const left = evaluate(node.left, checker)
    if (left === null) return null

    const right = evaluate(node.right, checker)
    if (right === null) return null

    return op(left, right)
  }

  return null
}

/**
 * Attempt to fold a bitwise expression tree to a single numeric value.
 * Returns `{ value, source }` where `source` is the original TypeScript
 * text (for use in a comment), or `null` if the expression contains
 * non-constant operands.
 *
 * When a `checker` is provided, identifiers with numeric literal types
 * (e.g. `declare const MASK: 256`) are resolved to their values.
 *
 * Callers must ensure the node actually involves a bitwise operation
 * (the BinaryExpression and PrefixUnaryExpression visitors already
 * check this before calling).
 */
export function tryFoldBitwise(
  node: ts.Expression,
  checker?: ts.TypeChecker,
): { value: number; source: string } | null {
  const value = evaluate(node, checker)
  if (value === null) return null

  return { value, source: node.getText() }
}
