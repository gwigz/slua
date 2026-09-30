/**
 * The one list of preset fields. `bun run generate` turns it into
 * `src/generated/layout.ts`, the byte offsets and switch bits the script
 * compiles against. Edit this list, never the generated file.
 *
 * Presets saved by one build and read by a later one need the same layout,
 * so add new fields at the end.
 */
export const FIELDS = [
  { name: "group", kind: "byte" },
  { name: "mode", kind: "byte" },
  { name: "intensity", kind: "percent" },
  { name: "glow", kind: "percent" },
  { name: "radius", kind: "byte" },
  { name: "red", kind: "byte" },
  { name: "green", kind: "byte" },
  { name: "blue", kind: "byte" },
  { name: "fadeMs", kind: "u16" },
  { name: "enabled", kind: "flag" },
  { name: "fullbright", kind: "flag" },
  { name: "castLight", kind: "flag" },
  { name: "sync", kind: "flag" },
  { name: "ownerOnly", kind: "flag" },
] as const satisfies readonly Field[]

export interface Field {
  name: string
  /**
   * `byte` is a whole number from 0 to 255, `percent` a value from 0 to 1
   * kept as a whole percentage, `u16` a whole number up to 65,535, and
   * `flag` one on/off bit in a shared byte.
   */
  kind: "byte" | "percent" | "u16" | "flag"
}
