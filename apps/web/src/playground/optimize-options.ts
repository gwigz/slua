import type { OptimizeFlags } from "@gwigz/slua-tstl-plugin"

export type OptimizeKey = keyof OptimizeFlags

export interface OptimizeOption {
  key: OptimizeKey
  label: string
  description: string
}

/**
 * Optimize flags surfaced as playground toggles, in display order. The plugin's
 * always-on transforms run regardless; these are the opt-in `optimize` passes.
 */
export const OPTIMIZE_OPTIONS: OptimizeOption[] = [
  {
    key: "indexOf",
    label: "indexOf presence",
    description: "Emit bare string.find / table.find for indexOf presence checks.",
  },
  {
    key: "foldBitwise",
    label: "Fold bitwise",
    description: "Fold compile-time constant bitwise expressions to a single number.",
  },
  {
    key: "simplifyNilChecks",
    label: "Simplify nil checks",
    description: "Rewrite not (x ~= nil) as x == nil.",
  },
  {
    key: "numericConcat",
    label: "Numeric concat",
    description: "Strip tostring() from number-typed template interpolations.",
  },
  {
    key: "defaultParams",
    label: "Default params",
    description: "Collapse if x == nil then x = <literal> end to x = x or <literal>.",
  },
  {
    key: "floorMultiply",
    label: "Floor multiply",
    description: "Reorder Math.floor((a / b) * c) to a * c // b.",
  },
  {
    key: "compoundAssignment",
    label: "Compound assignment",
    description: "Rewrite x = x + n to x += n.",
  },
  {
    key: "filter",
    label: "Inline filter",
    description: "Inline .filter() calls as for loops with ipairs.",
  },
  {
    key: "inlineLocals",
    label: "Inline locals",
    description: "Merge forward-declared local x with its first assignment.",
  },
  {
    key: "shortenTemps",
    label: "Shorten temps",
    description: "Shorten TSTL destructuring temp names (____fn_result_N -> _rN).",
  },
  {
    key: "minifyNames",
    label: "Minify names",
    description: "Rename locals, local functions and params to short names.",
  },
]

/** Most optimizations on by default; minifyNames stays off to keep output readable. */
export const DEFAULT_OPTIMIZE: Required<OptimizeFlags> = {
  indexOf: true,
  foldBitwise: true,
  simplifyNilChecks: true,
  numericConcat: true,
  defaultParams: true,
  floorMultiply: true,
  compoundAssignment: true,
  filter: true,
  inlineLocals: true,
  shortenTemps: true,
  minifyNames: false,
}
