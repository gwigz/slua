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
  typeParameters?: string[]
  deprecated?: boolean | { reason?: string; use?: string }
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
  /** Dot-called functions, emitted on the class metatable (`<name>Meta`). */
  functions?: FunctionDef[]
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
  enums: Record<string, LSLEnum>
  builderRulesets: Record<string, BuilderRuleset>
}

export interface LSLEnum {
  type: string
  prefix?: string
  tooltip?: string
}

/** `[type, name]` pair from a builder-ruleset rule's `params` list. */
export type BuilderRuleParam = [type: string, name: string]

export interface BuilderRuleVariant {
  "applies-to": string[]
  params: BuilderRuleParam[]
}

export interface BuilderRule {
  "method-name"?: string
  "face-target"?: boolean
  nullable?: boolean
  params: BuilderRuleParam[]
  "variant-enum"?: string
  variants?: BuilderRuleVariant[]
}

export interface BuilderRuleset {
  type: "builder" | "table"
  enum: string
  "lua-type"?: string
  "filler-tokens"?: string[]
  "flag-enum"?: string
  "flag-field"?: string
  "flag-mask"?: string
  rules?: Record<string, BuilderRule>
}

export interface LSLConstant {
  type: string
  value: string
  tooltip?: string
  private?: boolean
  "member-of"?: string[]
  "value-type"?: string
  "pretty-name"?: string
  "slua-type"?: string
  "slua-removed"?: boolean
  deprecated?: boolean | { reason?: string; use?: string }
  "slua-deprecated"?: boolean | { reason?: string; use?: string }
}

export interface LSLFunction {
  return?: string
  arguments?: Record<
    string,
    {
      type: string
      tooltip?: string
      ruleset?: string
      "index-semantics"?: boolean
      "bool-semantics"?: boolean
    }
  >[]
  tooltip?: string
  "slua-removed"?: boolean
  deprecated?: boolean | { reason?: string; use?: string }
  "slua-deprecated"?: boolean | { reason?: string; use?: string }
  "slua-return"?: string
  "detected-semantics"?: boolean
  "index-semantics"?: boolean
  "bool-semantics"?: boolean
  energy?: number
  sleep?: number
}

export interface LSLEvent {
  arguments?: Record<string, { type: string; tooltip?: string; "bool-semantics"?: boolean }>[]
  tooltip?: string
  "slua-removed"?: boolean
  deprecated?: boolean | { reason?: string; use?: string }
  "slua-deprecated"?: boolean | { reason?: string; use?: string }
  "detected-semantics"?: boolean
}

export interface TypedListArg {
  type: string
  name: string
}

export interface TypedListRule {
  name: string
  value: number
  args: TypedListArg[]
  returns?: TypedListArg[]
  comment?: string
}

export interface TypedListSubDispatch {
  constant: string
  name: string
  params: TypedListRule[]
}

export interface TypedListParamSet {
  name: string
  functions: string[]
  params: TypedListRule[]
  subDispatch?: TypedListSubDispatch
}

export interface TypedListParams {
  sets: TypedListParamSet[]
}
