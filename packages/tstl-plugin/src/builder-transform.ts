import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import { BUILDER_ROOTS, BUILDER_SETS } from "./generated/builder-data.js"
import type { BuilderRootDef, BuilderSetDef } from "./generated/builder-data.js"

interface ChainEntry {
  methodName: string
  args: ts.Expression[]
  /** For .link() callbacks */
  callback?: ts.ArrowFunction | ts.FunctionExpression
}

interface BuilderChain {
  /** The root call expression (e.g. setPrimParams(LINK_THIS)) */
  rootCall: ts.CallExpression
  /** Name of the root function */
  rootName: string
  /** Config for this root function */
  rootDef: BuilderRootDef
  /** Config for the param set */
  setDef: BuilderSetDef
  /** Chained method calls in order */
  entries: ChainEntry[]
}

/**
 * Attempt to match an expression as a builder chain.
 * Walks from the outermost call inward to find the root.
 */
export function matchBuilderChain(node: ts.CallExpression): BuilderChain | null {
  const entries: ChainEntry[] = []
  let current: ts.Expression = node

  // Walk inside-out: outermost call first, peel layers
  while (ts.isCallExpression(current) && ts.isPropertyAccessExpression(current.expression)) {
    const methodName = current.expression.name.text
    const args = [...current.arguments]

    // Check for callback arg (last arg being arrow/function)
    const lastArg = args[args.length - 1]
    let callback: ts.ArrowFunction | ts.FunctionExpression | undefined
    if (lastArg && (ts.isArrowFunction(lastArg) || ts.isFunctionExpression(lastArg))) {
      callback = lastArg
      args.pop()
    }

    entries.unshift({ methodName, args, callback })
    current = current.expression.expression
  }

  // `current` should now be the root call: setPrimParams(LINK_THIS)
  if (!ts.isCallExpression(current) || !ts.isIdentifier(current.expression)) {
    return null
  }

  const rootName = current.expression.text
  const rootDef = BUILDER_ROOTS[rootName]
  if (!rootDef) return null

  const setDef = BUILDER_SETS[rootDef.paramSet]
  if (!setDef) return null

  return { rootCall: current, rootName, rootDef, setDef, entries }
}

/**
 * Emit a builder chain as a flat Lua call to the corresponding ll.* function.
 */
export function emitBuilderChain(
  chain: BuilderChain,
  context: tstl.TransformationContext,
  node: ts.Node,
): tstl.Statement {
  const { rootCall, rootDef, setDef, entries } = chain

  // Transform root call args
  const rootArgs = rootCall.arguments.map((a) => context.transformExpression(a))

  // Build the flat list elements
  const listElements = flattenEntries(entries, setDef, context)

  // Build the ll.FunctionName call
  const llCall = tstl.createCallExpression(
    tstl.createTableIndexExpression(
      tstl.createIdentifier("ll"),
      tstl.createStringLiteral(rootDef.llFunction),
    ),
    [
      ...rootArgs.slice(0, rootDef.preListArgs),
      tstl.createTableExpression(
        listElements.map((e) => tstl.createTableFieldExpression(e)),
        node,
      ),
      ...rootArgs.slice(rootDef.preListArgs, rootDef.preListArgs + rootDef.postListArgs),
    ],
    node,
  )

  return tstl.createExpressionStatement(llCall, node)
}

/**
 * Flatten chain entries into a list of Lua expressions (constant, args, constant, args, ...).
 */
function flattenEntries(
  entries: ChainEntry[],
  setDef: BuilderSetDef,
  context: tstl.TransformationContext,
): tstl.Expression[] {
  const elements: tstl.Expression[] = []

  for (const entry of entries) {
    // Check for link callback
    if (setDef.linkMethod && entry.methodName === setDef.linkMethod) {
      elements.push(tstl.createIdentifier(setDef.linkConstant!))
      for (const arg of entry.args) {
        elements.push(context.transformExpression(arg))
      }
      // Flatten the callback's chain
      if (entry.callback) {
        const innerEntries = extractCallbackChain(entry.callback)
        if (innerEntries) {
          elements.push(...flattenEntries(innerEntries, setDef, context))
        }
      }
      continue
    }

    // Check for sub-dispatch (e.g. .typeBox())
    const subMatch = setDef.subDispatch?.find((s) => s.methodName === entry.methodName)
    if (subMatch) {
      elements.push(tstl.createIdentifier(subMatch.dispatchConstant))
      elements.push(tstl.createIdentifier(subMatch.shapeConstant))
      for (const arg of entry.args) {
        elements.push(context.transformExpression(arg))
      }
      continue
    }

    // Regular method
    const methodDef = setDef.methods[entry.methodName]
    if (methodDef) {
      elements.push(tstl.createIdentifier(methodDef.constant))
      for (const arg of entry.args) {
        elements.push(context.transformExpression(arg))
      }
    }
  }

  return elements
}

/**
 * Extract chain entries from a callback body.
 * Handles: `link => link.color(...)` (expression body)
 * and: `link => { return link.color(...) }` (block body with return)
 */
function extractCallbackChain(cb: ts.ArrowFunction | ts.FunctionExpression): ChainEntry[] | null {
  let expr: ts.Expression

  if (ts.isBlock(cb.body)) {
    // Block body, look for a single return statement
    const returnStmt = cb.body.statements.find(ts.isReturnStatement)
    if (!returnStmt?.expression) return null
    expr = returnStmt.expression
  } else {
    // Expression body
    expr = cb.body
  }

  // The parameter name (e.g. "link"), we walk until we hit an identifier matching it
  const paramName = cb.parameters[0]?.name
  if (!paramName || !ts.isIdentifier(paramName)) return null
  const paramText = paramName.text

  const entries: ChainEntry[] = []
  let current: ts.Expression = expr

  while (ts.isCallExpression(current) && ts.isPropertyAccessExpression(current.expression)) {
    const methodName = current.expression.name.text
    const args = [...current.arguments]

    let callback: ts.ArrowFunction | ts.FunctionExpression | undefined
    const lastArg = args[args.length - 1]
    if (lastArg && (ts.isArrowFunction(lastArg) || ts.isFunctionExpression(lastArg))) {
      callback = lastArg
      args.pop()
    }

    entries.unshift({ methodName, args, callback })
    current = current.expression.expression
  }

  // current should be the parameter identifier
  if (!ts.isIdentifier(current) || current.text !== paramText) return null

  return entries
}
