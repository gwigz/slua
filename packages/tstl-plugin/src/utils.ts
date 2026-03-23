import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import { EQUALITY_OPS } from "./constants.js"

/**
 * Creates a `bit32.<fn>(...args)` Lua call expression.
 * The optional `node` attaches TypeScript source-map information; when
 * patching already-lowered Lua AST nodes (e.g. from compound-assignment
 * desugaring) there is no originating TS node, so it may be omitted.
 */
export function createBit32Call(
  fn: string,
  args: tstl.Expression[],
  node?: ts.Node,
): tstl.CallExpression {
  return tstl.createCallExpression(
    tstl.createTableIndexExpression(tstl.createIdentifier("bit32"), tstl.createStringLiteral(fn)),
    args,
    node,
  )
}

/**
 * Returns true when `node` is `Math.floor(<single-arg>)`.
 */
export function isMathFloor(
  node: ts.CallExpression,
): node is ts.CallExpression & { arguments: [ts.Expression] } {
  return (
    node.arguments.length === 1 &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    node.expression.expression.text === "Math" &&
    node.expression.name.text === "floor"
  )
}

export function isZeroLiteral(node: ts.Expression): boolean {
  return ts.isNumericLiteral(node) && node.text === "0"
}

export function isNegatedEquality(op: ts.SyntaxKind): boolean {
  return (
    op === ts.SyntaxKind.ExclamationEqualsToken || op === ts.SyntaxKind.ExclamationEqualsEqualsToken
  )
}

/**
 * Detect `(a & b) !== 0`, `0 === (a & b)`, etc. and return the `&` expression
 * plus whether to negate the btest result.
 */
export function extractBtestPattern(
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
  // captures this: negated equality (!=) -> false -> don't negate btest.
  return { band: bandExpr, negate: !isNegatedEquality(op) }
}

/**
 * Detects `-1` as either a PrefixUnaryExpression (minus + 1) or a numeric literal with text "-1".
 */
export function isMinusOneLiteral(node: ts.Expression) {
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(node.operand) &&
    node.operand.text === "1"
  ) {
    return true
  }

  return ts.isNumericLiteral(node) && node.text === "-1"
}

/**
 * Detect `s.indexOf(x) >= 0`, `s.indexOf(x) !== -1`, etc. and return
 * the indexOf call plus whether the check means "not found" (negate).
 *
 * Presence patterns (found -> truthy): `>= 0`, `> -1`, `!== -1`, `!= -1`
 * Absence patterns (not found -> negate): `< 0`, `=== -1`, `== -1`
 * Handles both operand orders (indexOf on left or right).
 */
export function extractIndexOfPresence(
  node: ts.BinaryExpression,
  checker: ts.TypeChecker,
): { call: ts.CallExpression; isString: boolean; negate: boolean } | null {
  const op = node.operatorToken.kind

  let indexOfExpr: ts.Expression
  let comparand: ts.Expression
  let flipped: boolean

  // Try indexOf on the left
  if (ts.isCallExpression(node.left)) {
    indexOfExpr = node.left
    comparand = node.right
    flipped = false
  } else if (ts.isCallExpression(node.right)) {
    indexOfExpr = node.right
    comparand = node.left
    flipped = true
  } else {
    return null
  }

  // Verify it's an indexOf call on a string or array with 1 arg
  const call = indexOfExpr as ts.CallExpression
  if (!ts.isPropertyAccessExpression(call.expression)) return null
  if (call.expression.name.text !== "indexOf") return null
  if (call.arguments.length !== 1) return null

  const receiver = call.expression.expression
  let isString: boolean

  if (isStringType(receiver, checker)) {
    isString = true
  } else if (isArrayType(receiver, checker)) {
    isString = false
  } else {
    return null
  }

  // Determine the comparison semantics
  // For non-flipped (indexOf on left): indexOf >= 0, indexOf !== -1, indexOf < 0, indexOf === -1
  // For flipped (indexOf on right): 0 <= indexOf, -1 !== indexOf, 0 > indexOf, -1 === indexOf
  let negate: boolean | null = null

  if (isZeroLiteral(comparand)) {
    if (!flipped) {
      // indexOf >= 0 -> found; indexOf < 0 -> not found
      if (op === ts.SyntaxKind.GreaterThanEqualsToken) negate = false
      else if (op === ts.SyntaxKind.LessThanToken) negate = true
    } else {
      // 0 <= indexOf -> found; 0 > indexOf -> not found
      if (op === ts.SyntaxKind.LessThanEqualsToken) negate = false
      else if (op === ts.SyntaxKind.GreaterThanToken) negate = true
    }
  } else if (isMinusOneLiteral(comparand)) {
    if (!flipped) {
      // indexOf !== -1 -> found; indexOf === -1 -> not found; indexOf > -1 -> found
      if (isNegatedEquality(op)) negate = false
      else if (EQUALITY_OPS.has(op)) negate = true
      else if (op === ts.SyntaxKind.GreaterThanToken) negate = false
    } else {
      // -1 !== indexOf -> found; -1 === indexOf -> not found; -1 < indexOf -> found
      if (isNegatedEquality(op)) negate = false
      else if (EQUALITY_OPS.has(op)) negate = true
      else if (op === ts.SyntaxKind.LessThanToken) negate = false
    }
  }

  if (negate === null) return null

  return { call, isString, negate }
}

/**
 * Type-checking helpers for catalog transforms.
 */
export function isStringType(expr: ts.Expression, checker: ts.TypeChecker) {
  const type = checker.getTypeAtLocation(expr)
  return !!(type.flags & ts.TypeFlags.StringLike)
}

const STRING_OR_NUMBER = ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike

/**
 * Checks whether `expr` resolves to a string or number type.
 * Falls back to inspecting the symbol's declared type annotation when
 * `getTypeAtLocation` returns an unexpected type (e.g. `void` for identifiers
 * that shadow DOM globals like `name`).
 */
export function isStringOrNumberLike(checker: ts.TypeChecker, expr: ts.Expression): boolean {
  const type = checker.getTypeAtLocation(expr)
  if (type.flags & STRING_OR_NUMBER) return true

  // Fallback: resolve the type from the variable's type annotation directly.
  const symbol = checker.getSymbolAtLocation(expr)
  const decl = symbol?.valueDeclaration
  if (decl && ts.isVariableDeclaration(decl) && decl.type) {
    return !!(checker.getTypeFromTypeNode(decl.type).flags & STRING_OR_NUMBER)
  }

  return false
}

export function isArrayType(expr: ts.Expression, checker: ts.TypeChecker) {
  const type = checker.getTypeAtLocation(expr)
  return checker.isArrayLikeType(type)
}

export function isDetectedEventType(expr: ts.Expression, checker: ts.TypeChecker) {
  const type = checker.getTypeAtLocation(expr)
  return type.symbol?.name === "DetectedEvent"
}

/**
 * Returns true when `node` is `detectedEvent.index`, a property access
 * on a `DetectedEvent` reading the `.index` field.
 */
export function isDetectedEventIndex(node: ts.PropertyAccessExpression, checker: ts.TypeChecker) {
  return node.name.text === "index" && isDetectedEventType(node.expression, checker)
}

/**
 * Checks whether `node` is `obj.method(args)` where `obj` matches the
 * given type predicate and the method name matches.
 */
export function isMethodCall(
  node: ts.CallExpression,
  checker: ts.TypeChecker,
  typeGuard: (expr: ts.Expression, checker: ts.TypeChecker) => boolean,
  method: string,
  argCount?: number,
): node is ts.CallExpression & { expression: ts.PropertyAccessExpression } {
  if (!ts.isPropertyAccessExpression(node.expression)) return false
  if (node.expression.name.text !== method) return false
  if (argCount !== undefined && node.arguments.length !== argCount) return false
  return typeGuard(node.expression.expression, checker)
}

/**
 * Checks whether `node` is `Namespace.method(args)` using syntactic
 * identifier matching (no TypeChecker needed).
 */
export function isNamespaceCall(
  node: ts.CallExpression,
  namespace: string,
  method: string,
): node is ts.CallExpression & { expression: ts.PropertyAccessExpression } {
  if (!ts.isPropertyAccessExpression(node.expression)) return false
  if (node.expression.name.text !== method) return false

  return (
    ts.isIdentifier(node.expression.expression) && node.expression.expression.text === namespace
  )
}

/**
 * Checks whether `node` is a call to a global function by name.
 */
export function isGlobalCall(node: ts.CallExpression, name: string): boolean {
  return ts.isIdentifier(node.expression) && node.expression.text === name
}

/**
 * Creates a `ns.fn(...args)` Lua call expression.
 */
export function createNamespacedCall(
  ns: string,
  fn: string,
  args: tstl.Expression[],
  node?: ts.Node,
): tstl.CallExpression {
  return tstl.createCallExpression(
    tstl.createTableIndexExpression(tstl.createIdentifier(ns), tstl.createStringLiteral(fn)),
    args,
    node,
  )
}

/** Creates a `string.find(str, search, 1, true)` plain-text search call. */
export function createStringFindCall(
  str: tstl.Expression,
  search: tstl.Expression,
  node?: ts.Node,
): tstl.CallExpression {
  return createNamespacedCall(
    "string",
    "find",
    [str, search, tstl.createNumericLiteral(1), tstl.createBooleanLiteral(true)],
    node,
  )
}

/** Escapes a string for literal use inside `new RegExp(...)`. */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// ---------------------------------------------------------------------------
// Self-reassignment array concat -> table.extend optimization
// ---------------------------------------------------------------------------

/**
 * Detects `arr = arr.concat(b, c, ...)` where LHS is a simple identifier,
 * the receiver matches LHS, and all concat arguments are array-typed.
 */
export function extractConcatSelfAssignment(
  expr: ts.BinaryExpression,
  checker: ts.TypeChecker,
): { name: ts.Identifier; args: readonly ts.Expression[] } | null {
  if (expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return null
  if (!ts.isIdentifier(expr.left)) return null
  if (!ts.isCallExpression(expr.right)) return null
  if (!ts.isPropertyAccessExpression(expr.right.expression)) return null
  if (expr.right.expression.name.text !== "concat") return null
  if (!ts.isIdentifier(expr.right.expression.expression)) return null
  if (expr.right.expression.expression.text !== expr.left.text) return null
  if (expr.right.arguments.length === 0) return null

  for (const arg of expr.right.arguments) {
    if (!isArrayType(arg, checker)) return null
  }

  return { name: expr.left, args: expr.right.arguments }
}

/**
 * Detects `arr = [...arr, ...b, ...c]` where LHS is a simple identifier,
 * all elements are spreads, the first spread matches LHS, and all tail
 * spread expressions are array-typed.
 */
export function extractSpreadSelfAssignment(
  expr: ts.BinaryExpression,
  checker: ts.TypeChecker,
): { name: ts.Identifier; args: ts.Expression[] } | null {
  if (expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return null
  if (!ts.isIdentifier(expr.left)) return null
  if (!ts.isArrayLiteralExpression(expr.right)) return null

  const elements = expr.right.elements
  if (elements.length < 2) return null

  for (const el of elements) {
    if (!ts.isSpreadElement(el)) return null
  }

  const first = elements[0] as ts.SpreadElement
  if (!ts.isIdentifier(first.expression)) return null
  if (first.expression.text !== expr.left.text) return null

  const tailArgs: ts.Expression[] = []

  for (let i = 1; i < elements.length; i++) {
    const spread = elements[i] as ts.SpreadElement
    if (!isArrayType(spread.expression, checker)) return null
    tailArgs.push(spread.expression)
  }

  return { name: expr.left, args: tailArgs }
}

/**
 * Builds nested `table.extend` calls:
 * - Single arg: `table.extend(arr, b)`
 * - Multiple: `table.extend(table.extend(arr, b), c)`
 */
export function emitChainedExtend(
  target: tstl.Expression,
  args: [tstl.Expression, ...tstl.Expression[]],
  node: ts.Node,
): tstl.CallExpression {
  let result = createNamespacedCall("table", "extend", [target, args[0]], node)

  for (let i = 1; i < args.length; i++) {
    result = createNamespacedCall("table", "extend", [result, args[i]], node)
  }

  return result
}

// ---------------------------------------------------------------------------
// ll.* index-semantics helpers
// ---------------------------------------------------------------------------

export interface LLIndexSemantics {
  indexArgs: Set<string>
  indexReturn: boolean
}

/**
 * For an `ll.Foo(...)` call, inspect the resolved signature's JSDoc tags
 * to determine which arguments have `@indexArg` semantics and whether
 * the return value has `@indexReturn` semantics.
 */
export function getLLIndexSemantics(
  node: ts.CallExpression,
  checker: ts.TypeChecker,
): LLIndexSemantics | null {
  // Must be ll.Something(...)
  if (!ts.isPropertyAccessExpression(node.expression)) return null
  if (!ts.isIdentifier(node.expression.expression)) return null
  if (node.expression.expression.text !== "ll") return null

  const sig = checker.getResolvedSignature(node)
  const decl = sig?.declaration

  if (!decl || !ts.isFunctionDeclaration(decl)) return null

  const tags = ts.getJSDocTags(decl)
  const indexArgs = new Set<string>()
  let indexReturn = false

  for (const tag of tags) {
    const tagName = tag.tagName.text

    if (tagName === "indexArg") {
      const text =
        typeof tag.comment === "string"
          ? tag.comment
          : Array.isArray(tag.comment)
            ? tag.comment.map((c) => c.text).join("")
            : undefined

      if (text) {
        indexArgs.add(text.trim())
      }
    } else if (tagName === "indexReturn") {
      indexReturn = true
    }
  }

  if (indexArgs.size === 0 && !indexReturn) return null

  return { indexArgs, indexReturn }
}

/**
 * Adjusts a 0-based index argument to 1-based for Lua.
 * Constant-folds numeric literals; otherwise emits `expr + 1`.
 */
export function adjustIndexArg(
  arg: ts.Expression,
  context: tstl.TransformationContext,
): tstl.Expression {
  if (ts.isNumericLiteral(arg)) {
    return tstl.createNumericLiteral(Number(arg.text) + 1)
  }

  // DetectedEvent.index is already 1-based at runtime. The PropertyAccess
  // visitor emits `- 1` to make it 0-based for TS, and @indexArg adds `+ 1`.
  // These cancel out, so emit the raw property access directly.
  if (ts.isPropertyAccessExpression(arg) && isDetectedEventIndex(arg, context.checker)) {
    const obj = context.transformExpression(arg.expression)
    return tstl.createTableIndexExpression(obj, tstl.createStringLiteral("index"))
  }

  return tstl.createBinaryExpression(
    context.transformExpression(arg),
    tstl.createNumericLiteral(1),
    tstl.SyntaxKind.AdditionOperator,
    arg,
  )
}

/**
 * Emit an `ll.Foo(...)` call with automatic index adjustments:
 * - `@indexArg` parameters get `+1`
 * - `@indexReturn` wraps the result in a nil-safe `__tmp and (__tmp - 1)`
 */
export function emitLLIndexCall(
  node: ts.CallExpression,
  context: tstl.TransformationContext,
  semantics: LLIndexSemantics,
): tstl.Expression {
  const expr = node.expression as ts.PropertyAccessExpression
  const fnName = expr.name.text

  // Resolve parameter names from the declaration
  const sig = context.checker.getResolvedSignature(node)
  const params =
    sig?.declaration && ts.isFunctionDeclaration(sig.declaration)
      ? sig.declaration.parameters
      : undefined

  const args = node.arguments.map((arg, i) => {
    const paramName = params?.[i]?.name
    const name = paramName && ts.isIdentifier(paramName) ? paramName.text : undefined

    if (name && semantics.indexArgs.has(name)) {
      return adjustIndexArg(arg, context)
    }

    return context.transformExpression(arg)
  })

  const call = createNamespacedCall("ll", fnName, args, node)

  if (!semantics.indexReturn) {
    return call
  }

  // Check if return type is number-like (skip for list/string returns like llFindNotecardTextSync)
  const retType = context.checker.getTypeAtLocation(node)
  const isNumberReturn =
    !!(retType.flags & ts.TypeFlags.NumberLike) ||
    (retType.isUnion() && retType.types.some((t) => !!(t.flags & ts.TypeFlags.NumberLike)))

  if (!isNumberReturn) {
    return call
  }

  // Nil-safe return adjustment: `local __tmp = ll.Fn(...); __tmp and (__tmp - 1)`
  const tempId = tstl.createIdentifier("____tmp")

  context.addPrecedingStatements(tstl.createVariableDeclarationStatement(tempId, call, node))

  return tstl.createBinaryExpression(
    tstl.cloneIdentifier(tempId),
    tstl.createParenthesizedExpression(
      tstl.createBinaryExpression(
        tstl.cloneIdentifier(tempId),
        tstl.createNumericLiteral(1),
        tstl.SyntaxKind.SubtractionOperator,
      ),
    ),
    tstl.SyntaxKind.AndOperator,
    node,
  )
}
