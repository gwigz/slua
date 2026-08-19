import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import {
  isMethodCall,
  isNamespaceCall,
  isGlobalCall,
  isStringType,
  isArrayType,
  createNamespacedCall,
  createStringFindCall,
  isPlainFindLiteral,
} from "./utils.js"

/** UTF-8 byte length of `s` — Luau `#`/`string.sub` are byte-indexed. */
function utf8ByteLength(s: string): number {
  return new TextEncoder().encode(s).length
}

/**
 * Builds `string.sub(str, ...) == "<literal>"` for a literal prefix/suffix check.
 * `fromEnd` selects the suffix form `string.sub(str, -n)` over the prefix form
 * `string.sub(str, 1, n)`, where `n` is the literal's UTF-8 byte length.
 */
function affixCompare(
  str: tstl.Expression,
  literal: ts.StringLiteralLike,
  fromEnd: boolean,
  node: ts.Node,
): tstl.Expression {
  const n = utf8ByteLength(literal.text)

  const subArgs = fromEnd
    ? [str, tstl.createNumericLiteral(-n)]
    : [str, tstl.createNumericLiteral(1), tstl.createNumericLiteral(n)]

  return tstl.createBinaryExpression(
    createNamespacedCall("string", "sub", subArgs, node),
    tstl.createStringLiteral(literal.text, literal),
    tstl.SyntaxKind.EqualityOperator,
    node,
  )
}

export type CallTransform = {
  match: (node: ts.CallExpression, checker: ts.TypeChecker) => boolean
  emit: (node: ts.CallExpression, context: tstl.TransformationContext) => tstl.Expression
}

export const CALL_TRANSFORMS: CallTransform[] = [
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

      const findOrZero = tstl.createBinaryExpression(
        createStringFindCall(str, search, node),
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

      // Built inline (not via createStringFindCall) because of the custom `init`
      // start index; magic-free literals still drop the plain-text flag.
      const findArgs: tstl.Expression[] = isPlainFindLiteral(search)
        ? [str, search, init]
        : [str, search, init, tstl.createBooleanLiteral(true)]

      const findCall = createNamespacedCall("string", "find", findArgs, node)

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

      return tstl.createBinaryExpression(
        createStringFindCall(str, search, node),
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
  // str.startsWith(search)  (1-arg only)
  //   literal -> string.sub(str, 1, #search) == search  (empty -> true)
  //   else    -> string.find(str, search, 1, true) == 1
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "startsWith", 1),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      const arg = node.arguments[0]

      // Literal needle: compare the prefix directly, avoiding the pattern engine.
      if (ts.isStringLiteralLike(arg)) {
        return arg.text === ""
          ? tstl.createBooleanLiteral(true, node)
          : affixCompare(str, arg, false, node)
      }

      return tstl.createBinaryExpression(
        createStringFindCall(str, context.transformExpression(arg), node),
        tstl.createNumericLiteral(1),
        tstl.SyntaxKind.EqualityOperator,
        node,
      )
    },
  },
  // str.endsWith(search)
  //   literal  -> string.sub(str, -#search) == search  (empty -> true)
  //   variable -> e == "" or string.sub(str, -#e) == e  (e = hoisted needle)
  // Handled natively (no lualib helper) so the playground and build agree.
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "endsWith", 1),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      const arg = node.arguments[0]

      // Literal needle: compare the suffix directly.
      if (ts.isStringLiteralLike(arg)) {
        return arg.text === ""
          ? tstl.createBooleanLiteral(true, node)
          : affixCompare(str, arg, true, node)
      }

      // Variable needle: hoist it to a temp (single eval), guard the empty
      // case (`"".endsWith(x)` is true in JS when x is empty), then compare
      // the suffix: `e == "" or string.sub(str, -#e) == e`.
      const needle = tstl.createIdentifier(context.createTempName("ends"))
      context.addPrecedingStatements(
        tstl.createVariableDeclarationStatement(needle, context.transformExpression(arg), node),
      )

      const isEmpty = tstl.createBinaryExpression(
        tstl.cloneIdentifier(needle),
        tstl.createStringLiteral(""),
        tstl.SyntaxKind.EqualityOperator,
        node,
      )

      const suffix = createNamespacedCall(
        "string",
        "sub",
        [
          str,
          tstl.createUnaryExpression(
            tstl.createUnaryExpression(
              tstl.cloneIdentifier(needle),
              tstl.SyntaxKind.LengthOperator,
            ),
            tstl.SyntaxKind.NegationOperator,
          ),
        ],
        node,
      )

      const suffixMatches = tstl.createBinaryExpression(
        suffix,
        tstl.cloneIdentifier(needle),
        tstl.SyntaxKind.EqualityOperator,
        node,
      )

      return tstl.createBinaryExpression(isEmpty, suffixMatches, tstl.SyntaxKind.OrOperator, node)
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
  // str.replace / str.replaceAll -> ll.ReplaceSubString(str, search, replacement, count)
  // count=1 for replace (first match only), count=0 for replaceAll
  ...(
    [
      ["replace", 1],
      ["replaceAll", 0],
    ] as const
  ).map(
    ([method, count]): CallTransform => ({
      match: (node, checker) => isMethodCall(node, checker, isStringType, method, 2),
      emit: (node, context) => {
        const str = context.transformExpression(
          (node.expression as ts.PropertyAccessExpression).expression,
        )

        const search = context.transformExpression(node.arguments[0])
        const replacement = context.transformExpression(node.arguments[1])

        return createNamespacedCall(
          "ll",
          "ReplaceSubString",
          [str, search, replacement, tstl.createNumericLiteral(count)],
          node,
        )
      },
    }),
  ),
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
