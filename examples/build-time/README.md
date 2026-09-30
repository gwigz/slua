# Build Time

A light with a touch menu that settles everything it can while it builds. Field names, switch bits, and buttons are const enums, so the compiled script holds plain numbers. A release build drops every diagnostic, and a source map turns Second Life's line numbers back into TypeScript lines.

Touch the light to adjust brightness, glow, and size, switch it on or off, and save, load, or reset a preset. By default only the owner can use the menu.

## What it shows

- **Generated modules.** `tools/generate.ts` turns the lists in `tools/` into `src/generated/`: the preset's byte offsets and switch bits, and the menu's buttons with their labels
- **Const enums over a buffer.** `buffer.readu8(live, Offset.Intensity)` compiles to `buffer.readu8(live, 2)`, with no schema table or metatable at runtime
- **Names only where people read them.** The button labels are the one list of names the script keeps, because the menu shows them. A reply is matched against them to get its `Button` number
- **Checks at the edge.** A menu reply is text an avatar could type, so only a known label counts, and every change stays within its field's range
- **Release and debug builds.** `tsconfig.debug.json` extends `tsconfig.json` and sets the `TRACING` define to true. Every `if (TRACING)` block compiles to nothing in the release build, and tree shaking removes `trace` with it
- **Source maps.** Each build writes `main.slua.map` beside `main.slua`, and `tools/where.ts` reads it

## Build

```bash
bun run build
```

That generates `src/generated/`, then writes `dist/main.slua` (release) and `dist-debug/main.slua` (tracing on), each with its source map. `bun run build:release` and `bun run build:debug` build one of them.

Compare the two outputs to see what the define removed:

```bash
diff dist/main.slua dist-debug/main.slua
```

## Change the menu or the preset

Edit `tools/menu-buttons.ts` or `tools/preset-fields.ts`, then build. The generator rejects repeated names, more than 12 buttons, labels over 24 bytes, and more switches than fit in a byte. Add new preset fields at the end, so presets saved by an older build still line up.

## Trace errors back to TypeScript

Second Life reports errors against the compiled script, as `lua_script:` and a line number, with one line per frame of the traceback. `slua-viewer logs` from `@gwigz/slua-viewer-client` annotates those lines with the TypeScript they came from while you watch.

For a traceback someone pastes to you later, check out the commit you deployed and look it up:

```bash
pbpaste | bun run where
# lua_script:122 function press  <-  src/main.ts:82
# lua_script:207 function replied  <-  src/main.ts:151
```

`bun run where 122` looks up one line, and `--debug` reads the debug build's map. Keeping `dist/` and its maps in Git means the map for any deployed build is one checkout away.
