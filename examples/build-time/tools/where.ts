/**
 * Turns the line numbers in a Second Life error back into TypeScript lines,
 * using the source map the build wrote beside the script.
 *
 *   bun run where "lua_script:42: attempt to index nil"
 *   bun run where 42
 *   pbpaste | bun run where
 *   bun run where --debug 42
 *
 * `slua-viewer logs` does this for output it sees live. This is for an error
 * someone pasted to you later, such as a traceback from their copy of the
 * object. Check out the commit you deployed first, so the map matches.
 */
import { loadSourceMapFor } from "@gwigz/slua-viewer-client"
import { relative } from "node:path"

const args = process.argv.slice(2)
const debug = args.includes("--debug")
const script = debug ? "dist-debug/main.slua" : "dist/main.slua"
const map = await loadSourceMapFor(script)

if (!map) {
  console.error(`No source map beside ${script}. Run the build first.`)
  process.exit(1)
}

const text = args.filter((arg) => arg !== "--debug").join(" ") || (await Bun.stdin.text())

// A line number on its own, or the script's name and a line at the start of a
// line, which is how an error and each traceback frame begin
const POSITION = /^(?:[\w./\\-]*:)?(\d+)(?::|\s|$)/

for (const line of text.trim().split("\n")) {
  const row = POSITION.exec(line.trim())?.[1]
  const location = row ? map.mapRow(Number(row)) : undefined

  console.log(
    location ? `${line}  <-  ${relative(process.cwd(), location.source)}:${location.line}` : line,
  )
}
