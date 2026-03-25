import * as ts from "typescript"

export type DefineMap = Map<string, boolean | number | string>

/**
 * Attempt to statically evaluate a TS expression against the define map.
 * Returns the resolved value, or `undefined` if the expression cannot be
 * statically resolved (i.e. it should be left to the normal transpiler).
 *
 * Supported forms:
 * - Bare identifier: `CONFIG_X` -> lookup
 * - Negation: `!CONFIG_X`
 * - Strict equality: `CONFIG_X === true`, `CONFIG_X !== false`, etc.
 */
export function tryEvaluateCondition(
  expr: ts.Expression,
  defineMap: DefineMap,
): boolean | undefined {
  // Bare identifier: CONFIG_X
  if (ts.isIdentifier(expr)) {
    const value = defineMap.get(expr.text)
    return value === undefined ? undefined : !!value
  }

  // Negation: !CONFIG_X
  if (ts.isPrefixUnaryExpression(expr) && expr.operator === ts.SyntaxKind.ExclamationToken) {
    const inner = tryEvaluateCondition(expr.operand, defineMap)
    return inner === undefined ? undefined : !inner
  }

  // Strict equality/inequality: CONFIG_X === true, CONFIG_X !== false, etc.
  if (ts.isBinaryExpression(expr)) {
    const op = expr.operatorToken.kind

    if (
      op !== ts.SyntaxKind.EqualsEqualsEqualsToken &&
      op !== ts.SyntaxKind.ExclamationEqualsEqualsToken
    ) {
      return undefined
    }

    let identValue: boolean | number | string | undefined
    let literalValue: boolean | number | string | undefined

    // Try both orientations: CONFIG_X === true  or  true === CONFIG_X
    if (ts.isIdentifier(expr.left)) {
      identValue = defineMap.get(expr.left.text)
      literalValue = extractLiteral(expr.right)
    } else if (ts.isIdentifier(expr.right)) {
      identValue = defineMap.get(expr.right.text)
      literalValue = extractLiteral(expr.left)
    }

    if (identValue === undefined || literalValue === undefined) return undefined

    const equal = identValue === literalValue

    return op === ts.SyntaxKind.EqualsEqualsEqualsToken ? equal : !equal
  }

  return undefined
}

/**
 * Check whether a node has a `@define FLAG` JSDoc tag whose flag
 * is in the define map and resolves to falsy. When true, the
 * entire declaration should be stripped from the output.
 */
export function shouldStripDefineGuard(node: ts.Node, defineMap: DefineMap): boolean {
  const jsDocs = (node as { jsDoc?: ts.JSDoc[] }).jsDoc
  if (!jsDocs || jsDocs.length === 0) return false

  for (const tag of ts.getJSDocTags(node)) {
    if (tag.tagName.text === "define" && typeof tag.comment === "string") {
      const flag = tag.comment.trim()

      if (defineMap.has(flag) && !defineMap.get(flag)) {
        return true
      }
    }
  }

  return false
}

function extractLiteral(expr: ts.Expression): boolean | number | string | undefined {
  if (expr.kind === ts.SyntaxKind.TrueKeyword) return true
  if (expr.kind === ts.SyntaxKind.FalseKeyword) return false
  if (ts.isNumericLiteral(expr)) return Number(expr.text)
  if (ts.isStringLiteral(expr)) return expr.text

  // Handle negative numbers: -123
  if (
    ts.isPrefixUnaryExpression(expr) &&
    expr.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(expr.operand)
  ) {
    return -Number(expr.operand.text)
  }

  return undefined
}
