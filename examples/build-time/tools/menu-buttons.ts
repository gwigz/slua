/**
 * The touch menu's buttons, top row first. `bun run generate` turns this list
 * into `src/generated/menu.ts`: a const enum the script compiles against, and
 * the labels the menu shows, in the order `ll.Dialog` lays them out.
 *
 * The labels are the only names the running script keeps, because people
 * read them.
 */
export const ROWS = [
  [
    { name: "Dimmer", label: "Dimmer" },
    { name: "Brighter", label: "Brighter" },
    { name: "OnOff", label: "On/Off" },
  ],
  [
    { name: "LessGlow", label: "Less glow" },
    { name: "MoreGlow", label: "More glow" },
    { name: "Fullbright", label: "Fullbright" },
  ],
  [
    { name: "Smaller", label: "Smaller" },
    { name: "Larger", label: "Larger" },
    { name: "CastLight", label: "Cast light" },
  ],
  [
    { name: "Save", label: "Save" },
    { name: "Load", label: "Load" },
    { name: "Reset", label: "Reset" },
  ],
] as const satisfies readonly (readonly Button[])[]

export interface Button {
  /** The member name in the generated `Button` enum. */
  name: string
  /** What the menu shows. `ll.Dialog` allows up to 24 bytes. */
  label: string
}
