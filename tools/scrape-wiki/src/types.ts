export interface TypedListArg {
  type: string
  name: string
}

export interface TypedListRule {
  name: string
  value: number
  args: TypedListArg[]
  returns?: TypedListArg[]
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
