import yaml from "js-yaml"

export function parseSluaDefinitions(yamlContent: string) {
  const raw = yaml.load(yamlContent) as Record<string, unknown>

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
