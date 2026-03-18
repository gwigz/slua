export interface SLuaDefinitions {
  version: string
  baseClasses: BaseClass[]
  typeAliases: TypeAlias[]
  classes: ClassDef[]
  globalVariables: GlobalVariable[]
  globalFunctions: FunctionDef[]
  modules: ModuleDef[]
  constants: ConstantDef[]
  builtinTypes: Record<string, { tooltip: string }>
  builtinConstants: ConstantDef[]
  builtinFunctions: FunctionDef[]
}

export interface BaseClass {
  name: string
  comment?: string
  methods: MethodDef[]
  properties: PropertyDef[]
}

export interface MethodDef {
  name: string
  comment?: string
  parameters: ParameterDef[]
  returnType?: string
  overloads?: MethodDef[]
}

export interface PropertyDef {
  name: string
  type: string
  comment?: string
}

export interface ParameterDef {
  name: string
  type?: string
  comment?: string
}

export interface TypeAlias {
  name: string
  definition: string
  comment?: string
  export?: boolean
  "selene-type"?: unknown
}

export interface ClassDef {
  name: string
  comment?: string
  methods: MethodDef[]
  properties: PropertyDef[]
}

export interface GlobalVariable {
  name: string
  type: string
  comment?: string
  "slua-removed"?: boolean
}

export interface FunctionDef {
  name: string
  comment?: string
  parameters: ParameterDef[]
  returnType?: string
  typeParameters?: string[]
  "must-use"?: boolean
  deprecated?: boolean | { reason?: string; use?: string }
  overloads?: MethodDef[]
}

export interface ModuleDef {
  name: string
  comment?: string
  callable?: FunctionDef
  functions?: FunctionDef[]
  constants?: ConstantDef[]
}

export interface ConstantDef {
  name: string
  type: string
  value?: string
  comment?: string
}

export interface LSLDefinitions {
  constants: Record<string, LSLConstant>
  functions: Record<string, LSLFunction>
  events: Record<string, LSLEvent>
}

export interface LSLConstant {
  type: string
  value: string
  tooltip?: string
  "slua-removed"?: boolean
  "slua-deprecated"?: boolean | { reason?: string; use?: string }
}

export interface LSLFunction {
  return?: string
  arguments?: Record<string, { type: string; tooltip?: string }>[]
  tooltip?: string
  "slua-removed"?: boolean
  "slua-deprecated"?: boolean | { reason?: string; use?: string }
  "slua-return"?: string
  "detected-semantics"?: boolean
  energy?: number
  sleep?: number
}

export interface LSLEvent {
  arguments?: Record<string, { type: string; tooltip?: string }>[]
  tooltip?: string
  "slua-removed"?: boolean
  "detected-semantics"?: boolean
}
