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
} from "./utils.js"

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
  // str.startsWith(search) -> string.find(str, search, 1, true) == 1  (1-arg only)
  {
    match: (node, checker) => isMethodCall(node, checker, isStringType, "startsWith", 1),
    emit: (node, context) => {
      const str = context.transformExpression(
        (node.expression as ts.PropertyAccessExpression).expression,
      )

      const search = context.transformExpression(node.arguments[0])

      return tstl.createBinaryExpression(
        createStringFindCall(str, search, node),
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
