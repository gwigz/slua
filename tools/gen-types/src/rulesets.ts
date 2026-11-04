/**
 * Builder-ruleset expansion -- mirrors upstream `lsl_definitions/rulesets.py` and
 * `SLuaDefinitions._generate_ruleset_type_structs`. Rulesets live under
 * `builder-rulesets` in lsl_definitions.yaml: `table` rulesets describe the dict
 * form accepted by legacy ll.* functions, and the `prim-params` builder ruleset
 * describes the fluent `llprim.ParamSetter` methods. Types are emitted as Luau
 * strings so the regular type mapper handles the TypeScript conversion.
 */

import type { LSLConstant, LSLDefinitions, MethodDef, ParameterDef } from "./types.js"

/** Luau types for `value-type` annotations on table ruleset members. */
const TABLE_VALUE_TYPES: Record<string, string> = {
  float: "number",
  integer: "number",
  boolean: "boolean",
  vector: "vector",
  rotation: "quaternion",
  string: "string",
  key: "(string | uuid)",
  asset: "(string | uuid)",
  "string-csv": "{string}",
  "string-map": "{[string]: string | number | boolean | vector | quaternion}",
  "string-multi": "{string}",
}

/** Luau types for builder rule param types. */
const BUILDER_PARAM_TYPES: Record<string, string> = {
  integer: "number",
  link: "number",
  float: "number",
  string: "string",
  vector: "vector",
  rotation: "quaternion",
  boolean: "boolean",
  asset: "(string | uuid)",
}

export interface TableRulesetProperty {
  /** camelCase key used in TypeScript. */
  name: string
  /** snake_case key the SLua runtime reads, as named upstream. */
  luaName: string
  type: string
  comment?: string
}

/** Constants that belong to `enumName`, ordered by value. */
function enumMembers(lsl: LSLDefinitions, enumName: string) {
  return Object.entries(lsl.constants)
    .filter(([, constant]) => constant["member-of"]?.includes(enumName) && !constant.private)
    .toSorted(([, left], [, right]) => Number(left.value) - Number(right.value))
}

function stripPrefix(name: string, prefix: string | undefined) {
  return prefix && name.startsWith(prefix) ? name.slice(prefix.length) : name
}

function dropFillerTokens(strictName: string, fillerTokens: Set<string>) {
  const tokens = strictName.split("_").filter((token) => !fillerTokens.has(token))

  return tokens.length > 0 ? tokens.join("_") : strictName
}

/**
 * Derive property names for the members of `enumName`. Strict names strip the
 * enum prefix and lowercase. Pretty names also drop filler tokens, unless the
 * constant sets `pretty-name`. Auto-derived pretty names that collide revert to
 * their strict names.
 */
function expandMemberParams(lsl: LSLDefinitions, enumName: string, fillerTokens: Set<string>) {
  const prefix = lsl.enums[enumName]?.prefix

  const rows = enumMembers(lsl, enumName).map(([name, constant]) => {
    if (!constant["value-type"]) {
      throw new Error(`Constant ${name} is a member of ${enumName} but has no value-type`)
    }

    const strictName = stripPrefix(name, prefix).toLowerCase()
    const override = constant["pretty-name"]
    const prettyName = override ?? dropFillerTokens(strictName, fillerTokens)

    return { strictName, prettyName, override, constant }
  })

  const strictCounts = countNames(rows.map((row) => row.strictName))
  const prettyCounts = countNames(rows.map((row) => row.prettyName))

  for (const row of rows) {
    if (strictCounts.get(row.strictName)! > 1) {
      throw new Error(`Strict name collision in ${enumName}: ${row.strictName}`)
    }

    if (prettyCounts.get(row.prettyName)! > 1 && row.override) {
      throw new Error(`pretty-name collision in ${enumName}: ${row.prettyName}`)
    }
  }

  return rows.map((row) => ({
    name: prettyCounts.get(row.prettyName)! > 1 ? row.strictName : row.prettyName,
    valueType: row.constant["value-type"]!,
    constant: row.constant,
  }))
}

function countNames(names: string[]) {
  const counts = new Map<string, number>()

  for (const name of names) {
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }

  return counts
}

/** "max_body_length" -> "maxBodyLength" */
function camelKey(luaName: string) {
  const [first, ...rest] = luaName.split("_").filter((word) => word !== "")

  return first + rest.map((word) => word[0].toUpperCase() + word.slice(1)).join("")
}

function tableProperty(luaName: string, type: string, constant: LSLConstant): TableRulesetProperty {
  return {
    name: camelKey(luaName),
    luaName,
    type,
    ...(constant.tooltip ? { comment: constant.tooltip } : {}),
  }
}

/**
 * Expand every `table` ruleset into its dict properties, keyed by `lua-type`
 * (e.g. `HttpRequestParams`). Flag enums contribute one boolean per flag.
 */
export function expandTableRulesets(lsl: LSLDefinitions) {
  const tables = new Map<string, TableRulesetProperty[]>()

  for (const [rulesetName, ruleset] of Object.entries(lsl.builderRulesets)) {
    const luaType = ruleset["lua-type"]

    if (ruleset.type !== "table" || !luaType) {
      continue
    }

    const fillerTokens = new Set(ruleset["filler-tokens"] ?? [])

    const properties = expandMemberParams(lsl, ruleset.enum, fillerTokens).map((member) => {
      const baseType = TABLE_VALUE_TYPES[member.valueType] ?? "any"

      return tableProperty(member.name, `${baseType}?`, member.constant)
    })

    const flagEnum = ruleset["flag-enum"]

    if (flagEnum) {
      const prefix = lsl.enums[flagEnum]?.prefix
      const flagSuffix = (ruleset["flag-mask"] ?? "").toLowerCase()

      for (const [name, constant] of enumMembers(lsl, flagEnum)) {
        let strictName = stripPrefix(name, prefix).toLowerCase()

        if (flagSuffix && strictName.endsWith(flagSuffix)) {
          strictName = strictName.slice(0, -flagSuffix.length)
        }

        const propertyName = constant["pretty-name"] ?? dropFillerTokens(strictName, fillerTokens)

        properties.push(tableProperty(propertyName, "boolean?", constant))
      }
    }

    if (properties.length === 0) {
      throw new Error(`Ruleset ${rulesetName} expanded to no properties`)
    }

    properties.sort((left, right) =>
      left.luaName < right.luaName ? -1 : left.luaName > right.luaName ? 1 : 0,
    )

    const camelNames = countNames(properties.map((property) => property.name))

    for (const property of properties) {
      if (camelNames.get(property.name)! > 1) {
        throw new Error(`camelCase key collision in ${luaType}: ${property.name}`)
      }
    }

    tables.set(luaType, properties)
  }

  return tables
}

/** The `lua-type` of a table ruleset, used to widen ruleset-annotated arguments. */
export function rulesetTableType(lsl: LSLDefinitions, rulesetName: string | undefined) {
  if (!rulesetName) {
    return undefined
  }

  const ruleset = lsl.builderRulesets[rulesetName]

  if (!ruleset) {
    throw new Error(`Unknown ruleset ${rulesetName}`)
  }

  return ruleset["lua-type"]
}

/** ("PRIM_", "TYPE", "BOX") -> "primTypeBox", ("GLTF_BASE_COLOR") -> "gltfBaseColor". */
function builderMethodName(...parts: string[]) {
  const words = parts.flatMap((part) => part.split("_")).filter((word) => word !== "")

  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
      .join("")
  )
}

/**
 * Expand a `builder` ruleset into fluent methods. Each method takes a `self`,
 * an optional face target, then the rule params, and returns `this` so chains
 * keep the receiver type.
 */
export function expandBuilderRuleset(lsl: LSLDefinitions, rulesetName: string): MethodDef[] {
  const ruleset = lsl.builderRulesets[rulesetName]

  if (!ruleset?.rules) {
    throw new Error(`Unknown builder ruleset ${rulesetName}`)
  }

  const rulePrefix = lsl.enums[ruleset.enum]?.prefix ?? ""
  const methods: MethodDef[] = []

  const buildMethod = (
    name: string,
    constantName: string,
    rawParams: [string, string][],
    faceTarget: boolean,
    nullable: boolean,
  ): MethodDef => {
    const parameters: ParameterDef[] = [{ name: "self" }]

    if (faceTarget) {
      // Face is required even on nullable rules.
      parameters.push({ name: "face", type: "number" })
    }

    for (const [typeName, paramName] of rawParams) {
      const baseType = BUILDER_PARAM_TYPES[typeName]

      if (!baseType) {
        throw new Error(`Unknown builder param type ${typeName} in ${rulesetName}.${name}`)
      }

      // Nullable is represented through a blank string.
      const type = nullable ? `${baseType} | ""` : baseType

      parameters.push({ name: paramName, type })
    }

    const comment = lsl.constants[constantName]?.tooltip

    return { name, parameters, returnType: "this", ...(comment ? { comment } : {}) }
  }

  for (const [ruleName, rule] of Object.entries(ruleset.rules)) {
    const faceTarget = !!rule["face-target"]
    const nullable = !!rule.nullable

    if (rule.variants?.length) {
      const variantPrefix = lsl.enums[rule["variant-enum"]!]?.prefix ?? ""

      for (const variant of rule.variants) {
        for (const variantName of variant["applies-to"]) {
          methods.push(
            buildMethod(
              builderMethodName(rulePrefix, ruleName, variantName),
              `${variantPrefix}${variantName}`,
              variant.params,
              faceTarget,
              nullable,
            ),
          )
        }
      }
    } else {
      methods.push(
        buildMethod(
          rule["method-name"] ?? builderMethodName(ruleName),
          `${rulePrefix}${ruleName}`,
          rule.params,
          faceTarget,
          nullable,
        ),
      )
    }
  }

  return methods
}
