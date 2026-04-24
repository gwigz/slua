import yaml from "js-yaml"

const KEY_RENAMES: Record<string, string> = {
  "base-classes": "baseClasses",
  "builtin-constants": "builtinConstants",
  "builtin-functions": "builtinFunctions",
  "builtin-types": "builtinTypes",
  "global-functions": "globalFunctions",
  "global-variables": "globalVariables",
  "type-aliases": "typeAliases",
  "return-type": "returnType",
  "type-parameters": "typeParameters",
}

function renameKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(renameKeys)
  }

  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}

    for (const [k, v] of Object.entries(value)) {
      out[KEY_RENAMES[k] ?? k] = renameKeys(v)
    }

    return out
  }

  return value
}

export function parseSluaDefinitions(yamlContent: string) {
  const raw = renameKeys(yaml.load(yamlContent)) as Record<string, unknown>

  return {
    version: raw.version as string,
    baseClasses: (raw.baseClasses as any[]) ?? [],
    typeAliases: (raw.typeAliases as any[]) ?? [],
    classes: (raw.classes as any[]) ?? [],
    globalVariables: (raw.globalVariables as any[]) ?? [],
    globalFunctions: (raw.globalFunctions as any[]) ?? [],
    modules: (raw.modules as any[]) ?? [],
    constants: (raw.constants as any[]) ?? [],
    builtinTypes: (raw.builtinTypes as Record<string, any>) ?? {},
    builtinConstants: (raw.builtinConstants as any[]) ?? [],
    builtinFunctions: (raw.builtinFunctions as any[]) ?? [],
  }
}

export function parseLslDefinitions(yamlContent: string) {
  const raw = yaml.load(yamlContent) as Record<string, unknown>

  return {
    constants: (raw.constants as Record<string, any>) ?? {},
    functions: (raw.functions as Record<string, any>) ?? {},
    events: (raw.events as Record<string, any>) ?? {},
  }
}
