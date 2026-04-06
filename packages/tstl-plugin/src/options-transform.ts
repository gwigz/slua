import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import { BUILDER_ROOTS, BUILDER_SETS } from "./generated/builder-data.js"
import type { BuilderRootDef, BuilderSetDef } from "./generated/builder-data.js"
import { createNamespacedCall } from "./utils.js"

function stripDefaultQuotes(s: string): string {
  return s.replace(/^"|"$/g, "")
}

interface OptionsCallMatch {
  rootCall: ts.CallExpression
  rootDef: BuilderRootDef
  setDef: BuilderSetDef
  preArgs: ts.Expression[]
  optionsObject: ts.ObjectLiteralExpression
}

/**
 * Match a call expression as an options-object pattern.
 * e.g. castRay(start, end, { maxHits: 4 })
 * e.g. httpRequest(url, { method: "POST", body: "payload" })
 */
export function matchOptionsCall(node: ts.CallExpression): OptionsCallMatch | null {
  if (!ts.isIdentifier(node.expression)) return null

  const rootName = node.expression.text
  const rootDef = BUILDER_ROOTS[rootName]
  if (!rootDef?.optionsArg) return null

  const setDef = BUILDER_SETS[rootDef.paramSet]
  if (!setDef) return null

  // Options object is right after pre-list args (post-list args are inside the object now)
  if (node.arguments.length !== rootDef.preListArgs + 1) return null

  const optionsArg = node.arguments[rootDef.preListArgs]
  if (!ts.isObjectLiteralExpression(optionsArg)) return null

  return {
    rootCall: node,
    rootDef,
    setDef,
    preArgs: node.arguments.slice(0, rootDef.preListArgs) as ts.Expression[],
    optionsObject: optionsArg,
  }
}

/**
 * Emit an options-object call as a flat ll.* call.
 * Returns an expression (not a statement) so it works in any position.
 */
export function emitOptionsCall(
  match: OptionsCallMatch,
  context: tstl.TransformationContext,
  node: ts.Node,
): tstl.Expression {
  const { rootDef, setDef, preArgs, optionsObject } = match

  const transformedPreArgs = preArgs.map((a) => context.transformExpression(a))
  const postArgNames = new Set(rootDef.postListArgNames ?? [])
  const defaults = rootDef.optionsDefaults ?? {}

  const listElements: tstl.Expression[] = []
  const postArgValues = new Map<string, ts.Expression>()
  const seenProps = new Set<string>()

  for (const prop of optionsObject.properties) {
    let name: string | undefined
    let value: ts.Expression | undefined

    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
      name = prop.name.text
      value = prop.initializer
    } else if (ts.isShorthandPropertyAssignment(prop)) {
      name = prop.name.text
      value = prop.name
    } else {
      return context.superTransformExpression(match.rootCall)
    }

    seenProps.add(name)

    if (postArgNames.has(name)) {
      postArgValues.set(name, value)
      continue
    }

    const methodDef = setDef.methods[name]
    if (!methodDef) {
      return context.superTransformExpression(match.rootCall)
    }

    listElements.push(tstl.createIdentifier(methodDef.constant))
    listElements.push(context.transformExpression(value))
  }

  // Emit default values for params that weren't specified
  for (const [paramName, defaultValue] of Object.entries(defaults)) {
    if (postArgNames.has(paramName)) continue
    if (seenProps.has(paramName)) continue

    const methodDef = setDef.methods[paramName]
    if (methodDef) {
      listElements.push(tstl.createIdentifier(methodDef.constant))
      listElements.push(tstl.createStringLiteral(stripDefaultQuotes(defaultValue)))
    }
  }

  // Build post-list args, using defaults for missing ones
  const transformedPostArgs: tstl.Expression[] = []
  for (const argName of rootDef.postListArgNames ?? []) {
    const value = postArgValues.get(argName)
    if (value) {
      transformedPostArgs.push(context.transformExpression(value))
    } else {
      const def = defaults[argName] ?? '""'
      transformedPostArgs.push(tstl.createStringLiteral(stripDefaultQuotes(def)))
    }
  }

  return createNamespacedCall(
    "ll",
    rootDef.llFunction,
    [
      ...transformedPreArgs,
      tstl.createTableExpression(
        listElements.map((e) => tstl.createTableFieldExpression(e)),
        node,
      ),
      ...transformedPostArgs,
    ],
    node,
  )
}
