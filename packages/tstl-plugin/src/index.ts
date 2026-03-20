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
function isMathFloor(
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
  // captures this: negated equality (!=) -> false -> don't negate btest.
  return { band: bandExpr, negate: !isNegatedEquality(op) }
}

/**
 * Type-checking helpers for catalog transforms.
 */
function isStringType(expr: ts.Expression, checker: ts.TypeChecker): boolean {
  const type = checker.getTypeAtLocation(expr)
  return !!(type.flags & ts.TypeFlags.StringLike)
}

function isArrayType(expr: ts.Expression, checker: ts.TypeChecker): boolean {
  const type = checker.getTypeAtLocation(expr)
  return checker.isArrayLikeType(type)
}

/**
 * Checks whether `node` is `obj.method(args)` where `obj` matches the
 * given type predicate and the method name matches.
 */
function isMethodCall(
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
function isNamespaceCall(
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
function isGlobalCall(node: ts.CallExpression, name: string): boolean {
  return ts.isIdentifier(node.expression) && node.expression.text === name
}

/**
 * Creates a `ns.fn(...args)` Lua call expression.
 */
function createNamespacedCall(
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

type CallTransform = {
  match: (node: ts.CallExpression, checker: ts.TypeChecker) => boolean
  emit: (node: ts.CallExpression, context: tstl.TransformationContext) => tstl.Expression
}

const CALL_TRANSFORMS: CallTransform[] = [
  // JSON.stringify(val) -> lljson.encode(val)
  {
    match: (node) => isNamespaceCall(node, "JSON", "stringify"),
    emit: (node, context) => {
      const args = node.arguments.map((a) => context.transformExpression(a))
      return createNamespacedCall("lljson", "encode", args, node)
    },
  },
  // JSON.parse(str) -> lljson.decode(str)
  {
    match: (node) => isNamespaceCall(node, "JSON", "parse"),
    emit: (node, context) => {
      const args = node.arguments.map((a) => context.transformExpression(a))
      return createNamespacedCall("lljson", "decode", args, node)
    },
  },
  // btoa(str) -> llbase64.encode(str)
  {
    match: (node) => isGlobalCall(node, "btoa") && node.arguments.length === 1,
    emit: (node, context) => {
      const args = node.arguments.map((a) => context.transformExpression(a))
      return createNamespacedCall("llbase64", "encode", args, node)
    },
  },
  // atob(str) -> llbase64.decode(str)
  {
    match: (node) => isGlobalCall(node, "atob") && node.arguments.length === 1,
    emit: (node, context) => {
      const args = node.arguments.map((a) => context.transformExpression(a))
      return createNamespacedCall("llbase64", "decode", args, node)
    },
  },
  // str.toUpperCase() -> ll.ToUpper(str)
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "toUpperCase", 0),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      return createNamespacedCall("ll", "ToUpper", [str], node)
    },
  },
  // str.toLowerCase() -> ll.ToLower(str)
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "toLowerCase", 0),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      return createNamespacedCall("ll", "ToLower", [str], node)
    },
  },
  // str.trim() -> ll.StringTrim(str, STRING_TRIM)
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "trim", 0),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      return createNamespacedCall(
        "ll",
        "StringTrim",
        [str, tstl.createIdentifier("STRING_TRIM")],
        node,
      )
    },
  },
  // str.trimStart() -> ll.StringTrim(str, STRING_TRIM_HEAD)
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "trimStart", 0),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      return createNamespacedCall(
        "ll",
        "StringTrim",
        [str, tstl.createIdentifier("STRING_TRIM_HEAD")],
        node,
      )
    },
  },
  // str.trimEnd() -> ll.StringTrim(str, STRING_TRIM_TAIL)
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "trimEnd", 0),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      return createNamespacedCall(
        "ll",
        "StringTrim",
        [str, tstl.createIdentifier("STRING_TRIM_TAIL")],
        node,
      )
    },
  },
  // str.indexOf(x) -> (string.find(str, x, 1, true) or 0) - 1
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "indexOf", 1),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      const search = context.transformExpression(node.arguments[0])

      const findCall = createNamespacedCall(
        "string",
        "find",
        [str, search, tstl.createNumericLiteral(1), tstl.createBooleanLiteral(true)],
        node,
      )

      const findOrZero = tstl.createBinaryExpression(
        findCall,
        tstl.createNumericLiteral(0),
        tstl.SyntaxKind.OrOperator,
        node,
      )

      return tstl.createBinaryExpression(
        tstl.createParenthesizedExpression(findOrZero),
        tstl.createNumericLiteral(1),
        tstl.SyntaxKind.SubtractionOperator,
        node,
      )
    },
  },
  // str.indexOf(x, fromIndex) -> (string.find(str, x, fromIndex + 1, true) or 0) - 1
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "indexOf", 2),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      const search = context.transformExpression(node.arguments[0])
      const fromArg = node.arguments[1]

      const init = ts.isNumericLiteral(fromArg)
        ? tstl.createNumericLiteral(Number(fromArg.text) + 1)
        : tstl.createBinaryExpression(
            context.transformExpression(fromArg),
            tstl.createNumericLiteral(1),
            tstl.SyntaxKind.AdditionOperator,
            node,
          )

      const findCall = createNamespacedCall(
        "string",
        "find",
        [str, search, init, tstl.createBooleanLiteral(true)],
        node,
      )

      const findOrZero = tstl.createBinaryExpression(
        findCall,
        tstl.createNumericLiteral(0),
        tstl.SyntaxKind.OrOperator,
        node,
      )

      return tstl.createBinaryExpression(
        tstl.createParenthesizedExpression(findOrZero),
        tstl.createNumericLiteral(1),
        tstl.SyntaxKind.SubtractionOperator,
        node,
      )
    },
  },
  // str.includes(x) -> string.find(str, x, 1, true) ~= nil
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "includes", 1),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      const search = context.transformExpression(node.arguments[0])

      const findCall = createNamespacedCall(
        "string",
        "find",
        [str, search, tstl.createNumericLiteral(1), tstl.createBooleanLiteral(true)],
        node,
      )

      return tstl.createBinaryExpression(
        findCall,
        tstl.createNilLiteral(),
        tstl.SyntaxKind.InequalityOperator,
        node,
      )
    },
  },
  // str.split(sep) -> string.split(str, sep)  (1-arg only)
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "split", 1),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      const sep = context.transformExpression(node.arguments[0])

      return createNamespacedCall("string", "split", [str, sep], node)
    },
  },
  // str.repeat(n) -> string.rep(str, n)
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "repeat", 1),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      const n = context.transformExpression(node.arguments[0])

      return createNamespacedCall("string", "rep", [str, n], node)
    },
  },
  // str.startsWith(search) -> string.find(str, search, 1, true) == 1  (1-arg only)
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "startsWith", 1),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      const search = context.transformExpression(node.arguments[0])

      const findCall = createNamespacedCall(
        "string",
        "find",
        [str, search, tstl.createNumericLiteral(1), tstl.createBooleanLiteral(true)],
        node,
      )

      return tstl.createBinaryExpression(
        findCall,
        tstl.createNumericLiteral(1),
        tstl.SyntaxKind.EqualityOperator,
        node,
      )
    },
  },
  // str.substring(start) -> string.sub(str, start + 1)
  // str.substring(start, end) -> string.sub(str, start + 1, end)
  {
    match: (node, checker) => {
      if (!isMethodCall(node, checker, isStringType, "substring")) {
        return false
      }

      return node.arguments.length === 1 || node.arguments.length === 2
    },
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      const startArg = node.arguments[0]

      const start = ts.isNumericLiteral(startArg)
        ? tstl.createNumericLiteral(Number(startArg.text) + 1)
        : tstl.createBinaryExpression(
            context.transformExpression(startArg),
            tstl.createNumericLiteral(1),
            tstl.SyntaxKind.AdditionOperator,
            node,
          )

      const args: tstl.Expression[] = [str, start]

      if (node.arguments.length === 2) {
        args.push(context.transformExpression(node.arguments[1]))
      }

      return createNamespacedCall("string", "sub", args, node)
    },
  },
  // str.replaceAll(search, replacement) -> ll.ReplaceSubString(str, search, replacement, 0)
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "replaceAll", 2),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      const search = context.transformExpression(node.arguments[0])
      const replacement = context.transformExpression(node.arguments[1])

      return createNamespacedCall(
        "ll",
        "ReplaceSubString",
        [str, search, replacement, tstl.createNumericLiteral(0)],
        node,
      )
    },
  },
  // arr.includes(val) -> table.find(arr, val) ~= nil
  {
    match: (node, checker) => isMethodCall(node, checker, isArrayType, "includes", 1),
    emit: (node, context) => {
      const arr = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      const val = context.transformExpression(node.arguments[0])
      const findCall = createNamespacedCall("table", "find", [arr, val], node)

      return tstl.createBinaryExpression(
        findCall,
        tstl.createNilLiteral(),
        tstl.SyntaxKind.InequalityOperator,
        node,
      )
    },
  },
  // arr.indexOf(val) -> (table.find(arr, val) or 0) - 1  (1-arg only)
  {
    match: (node, checker) => isMethodCall(node, checker, isArrayType, "indexOf", 1),
    emit: (node, context) => {
      const arr = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      const val = context.transformExpression(node.arguments[0])
      const findCall = createNamespacedCall("table", "find", [arr, val], node)

      const findOrZero = tstl.createBinaryExpression(
        findCall,
        tstl.createNumericLiteral(0),
        tstl.SyntaxKind.OrOperator,
        node,
      )

      return tstl.createBinaryExpression(
        tstl.createParenthesizedExpression(findOrZero),
        tstl.createNumericLiteral(1),
        tstl.SyntaxKind.SubtractionOperator,
        node,
      )
    },
  },
]

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
      }

      return context.superTransformStatements(node)
    },

    [ts.SyntaxKind.CallExpression]: (node: ts.CallExpression, context) => {
      // Catalog-driven transforms
      for (const transform of CALL_TRANSFORMS) {
        if (transform.match(node, context.checker)) {
          return transform.emit(node, context)
        }
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

    return diagnostics
  },

  beforeEmit(program, _options, _emitHost, result) {
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
  },
}

export default plugin
