import { isAbsolute, resolve } from "node:path"
import pc from "picocolors"
import { eachPrim } from "../addressing.js"
import type {
  ObjectUpdateMessage,
  PublishedObject,
  RuntimeDebug,
  RuntimeError,
} from "../protocol/types.js"
import { loadSourceMapFor, type SourceMap } from "../sourcemap.js"
import { loadConfig } from "../targets.js"
import { displayPath, type Reporter } from "./output.js"

export interface TargetMap {
  name: string
  /** The item the target deploys to, when the config names one. */
  item?: string
  map: SourceMap
}

export interface MappedLocation {
  target: string
  source: string
  line: number
}

export interface Targets {
  maps: TargetMap[]
  /** Lowercased item names the config's targets deploy to. */
  items: Set<string>
}

/**
 * What `slua.json` says about the scripts this project deploys.
 *
 * Runtime output reports positions in the generated Lua (`lua_script:5`),
 * which nobody wrote, so the maps that bring compile errors home are worth
 * having here too. `--targets` filters on the item names, and a target with no
 * source map still counts for that.
 */
export async function loadTargets(): Promise<Targets> {
  const config = await loadConfig()
  const maps: TargetMap[] = []
  const items = new Set<string>()

  if (!config) return { maps, items }

  for (const [name, target] of Object.entries(config.targets)) {
    if (target.item) items.add(target.item.toLowerCase())
    if (!target.file) continue

    const file = isAbsolute(target.file) ? target.file : resolve(config.root, target.file)
    const map = await loadSourceMapFor(file)

    if (map) maps.push({ name, item: target.item, map })
  }

  return { maps, items }
}

/**
 * A position at the head of a runtime line.
 *
 * The viewer reports an error as `lua_script:4: message` and each traceback
 * frame as a bare `lua_script:4`. Anchoring to the start of the line and
 * requiring a colon or the line's end after the row keeps ordinary output like
 * `http:80 responded` from reading as a position.
 */
const RUNTIME_POSITION = /^(?:\[[^\]]*\]|[\w./\\-]*):(\d+)(?::|$)/

/** The generated row a runtime line reports, or 0 when it names none. */
export function rowIn(text: string): number {
  const match = RUNTIME_POSITION.exec(text.trim())

  return match ? Number(match[1]) : 0
}

/**
 * The maps that could describe the script an event came from.
 *
 * A viewer advertising `unifiedDiagnostics` names the item, so a row several
 * maps happen to cover is no longer reported against all of them. An event
 * with no item, or naming one no target claims, falls back to every map.
 */
export function mapsFor(params: RuntimeDebug, maps: TargetMap[]): TargetMap[] {
  const script = params.item?.name

  if (!script) return maps

  const named = maps.filter((entry) => entry.item?.toLowerCase() === script.toLowerCase())

  return named.length > 0 ? named : maps
}

/**
 * Every id a runtime event could name for one published object.
 *
 * A viewer advertising `unifiedDiagnostics` reports `objectId` as the
 * linkset's root and the speaking prim as `primId`. An older one puts the
 * speaking prim in `objectId` alone, so a script in a child prim never names
 * the root. Listing every prim matches both.
 */
export function objectIds(object: PublishedObject): Set<string> {
  return new Set(eachPrim(object).map((prim) => prim.primId))
}

export function withUpdate(ids: Set<string>, update: ObjectUpdateMessage): Set<string> {
  const links = update.changes?.linkedObjects?.added ?? update.linkedObjects ?? []

  // Only ever grows: an id that stopped being ours risks keeping a line,
  // where forgetting one risks losing output the stream was asked for.
  return new Set([...ids, update.objectId, ...links.map((link) => link.linkId)])
}

export function fromObject(params: RuntimeDebug, ids: Set<string>): boolean {
  return [params.item?.rootId, params.objectId, params.primId].some(
    (id) => id !== undefined && ids.has(id),
  )
}

/**
 * Whether an event names an item one of the config's targets deploys to.
 *
 * A viewer that sends no item reference cannot be filtered this way, so its
 * output is kept and `logs` says so once.
 */
export function namesTarget(params: RuntimeDebug, items: Set<string>): boolean {
  const script = params.item?.name

  if (!script) return true

  return items.has(script.toLowerCase())
}

/**
 * Whether a runtime event belongs to the stream the flags asked for.
 *
 * `ids` is unset until the named object resolves, which under `--wait` can
 * take minutes. Naming an object holds output back for that long rather than
 * letting every other object's through in the meantime.
 */
export function wantedEvent(
  params: RuntimeDebug,
  command: { object?: string; targets?: boolean },
  ids: Set<string> | undefined,
  items: Set<string>,
): boolean {
  if (command.object && !ids) return false
  if (ids && !fromObject(params, ids)) return false

  return !command.targets || namesTarget(params, items)
}

export function mapRow(row: number, maps: TargetMap[]): MappedLocation[] {
  if (row <= 0) return []

  return maps.flatMap(({ name, map }) => {
    const location = map.mapRow(row)

    return location ? [{ target: name, source: location.source, line: location.line }] : []
  })
}

/**
 * A row can map through more than one target's map, and nothing here names the
 * script that produced it. Naming the target beats picking one and hoping.
 */
function formatLocation(location: MappedLocation, ambiguous: boolean): string {
  const where = `${displayPath(location.source)}:${location.line}`

  return ambiguous ? `${where} (${location.target})` : where
}

function position(line: number, column: number): string {
  return column > 0 ? `line ${line}, column ${column}` : `line ${line}`
}

/**
 * The text of a runtime event.
 *
 * `message` is the whole raw chat line and carries the traceback, so it wins
 * over the viewer's extracted `error`. Without `unifiedDiagnostics` both that
 * and `line` arrive empty and the detail follows as a separate `runtime.debug`
 * message, which would otherwise print as a bare object name.
 */
export function runtimeText(params: RuntimeDebug | RuntimeError, level: "debug" | "error"): string {
  const { error = "", line = 0, column = 0 } = params as RuntimeError
  const text = params.message || error

  if (text) {
    if (line <= 0) return text

    // The text usually names the line itself, as `lua_script:4: ...`, but
    // never the column, so suppressing the whole position would lose one the
    // viewer went to the trouble of reporting.
    if (!text.includes(`:${line}:`)) return `${text} (${position(line, column)})`

    return column > 0 ? `${text} (column ${column})` : text
  }

  if (line > 0) return `error on ${position(line, column)}`

  return level === "error"
    ? "script error without text; an older viewer sends the detail as a separate debug message"
    : ""
}

/**
 * One event's worth of lines, and everywhere they map back to.
 *
 * The viewer packs the error text and its traceback into one multi-line
 * message, so a line at a time is the only way to find the positions in it.
 * Rows are deduplicated: the error line and its first traceback frame report
 * the same one.
 */
export function runtimeLines(
  params: RuntimeDebug | RuntimeError,
  level: "debug" | "error",
  maps: TargetMap[],
): { lines: string[]; mapped: MappedLocation[] } {
  const lines = [
    ...runtimeText(params, level).split("\n"),
    ...((params as RuntimeError).stack ?? []),
  ]
    .map((line) => line.trimEnd())
    .filter((line) => line !== "")

  const rows = new Set(lines.map(rowIn).filter((row) => row > 0))

  if (rows.size === 0 && (params as RuntimeError).line > 0) {
    rows.add((params as RuntimeError).line)
  }

  return { lines, mapped: [...rows].flatMap((row) => mapRow(row, maps)) }
}

/**
 * `owner_say` is the script talking to its owner rather than debug output. The
 * two are indistinguishable without the channel the viewer now sends.
 */
export function tagFor(level: "debug" | "error", params: RuntimeDebug): string {
  if (level === "error") return pc.red("error")

  return params.channel === "owner_say" ? pc.dim("say") : pc.dim("debug")
}

/**
 * Who produced a line, in the `object/item` addressing the other commands take,
 * so a name read out of the stream pastes straight into a `pull` or a `push`.
 * The item half needs a viewer advertising `unifiedDiagnostics`.
 */
export function sourceName(params: RuntimeDebug): string {
  const object = params.objectName || params.objectId
  const script = params.item?.name

  return script ? `${object}/${script}` : object
}

/**
 * Numbers every runtime event this process has formatted.
 *
 * Monotonic and process-local, so a caller can say "output after this point".
 * That is what `push --tail`, `logs --since` and an agent waiting on the next
 * push all ask for. Nothing needs it to survive a restart.
 */
let sequence = 0

/** The last sequence number handed out, without consuming one. */
export function cursor(): number {
  return sequence
}

/**
 * Takes the next number in the sequence.
 *
 * A push takes one too, so it has a position in the same ordering as the
 * output and never shares a number with an event. That is what makes "wait for
 * a push newer than this cursor" unambiguous.
 */
export function nextCursor(): number {
  return ++sequence
}

export interface RuntimeRecord {
  /** Position in this process's event stream. */
  seq: number
  /** When the event was formatted, the closest we get to when it happened. */
  time: string
  level: "debug" | "error"
  event: RuntimeDebug | RuntimeError
  /** The message split into its text and traceback, blank lines dropped. */
  lines: string[]
  mapped: MappedLocation[]
  /** Whether more than one target's map could describe this event. */
  ambiguous: boolean
}

/**
 * Formats a runtime event without printing it, so a caller collecting events
 * rather than streaming them, as `push --tail` does, gets the shape `logs`
 * prints.
 */
export function toRecord(
  level: "debug" | "error",
  event: RuntimeDebug | RuntimeError,
  maps: TargetMap[],
): RuntimeRecord {
  const scoped = mapsFor(event, maps)
  const { lines, mapped } = runtimeLines(event, level, scoped)

  // Numbered here, not at each call site, so every path that formats an event
  // lands in the same sequence.
  return {
    seq: nextCursor(),
    time: new Date().toISOString(),
    level,
    event,
    lines,
    mapped,
    ambiguous: scoped.length > 1,
  }
}

/** The JSON shape a record serialises to, in `--json` output and in logs. */
export function recordPayload(record: RuntimeRecord): Record<string, unknown> {
  return {
    seq: record.seq,
    time: record.time,
    level: record.level,
    ...record.event,
    mapped: record.mapped,
  }
}

/**
 * Rebuilds a record from one this process wrote earlier.
 *
 * Nothing is remapped or renumbered. Reading `.slua/logs.jsonl` back has to
 * print what was printed at the time, not what today's source maps say.
 */
export function fromPayload(payload: Record<string, unknown>): RuntimeRecord {
  const level = payload.level === "error" ? "error" : "debug"
  const event = payload as unknown as RuntimeDebug | RuntimeError
  const mapped = (payload.mapped as MappedLocation[] | undefined) ?? []
  const { lines } = runtimeLines(event, level, [])

  return {
    seq: Number(payload.seq ?? 0),
    time: String(payload.time ?? ""),
    level,
    event,
    lines,
    mapped,
    ambiguous: new Set(mapped.map((location) => location.target)).size > 1,
  }
}

/** Prints a record, as one NDJSON line under `--json` and as text otherwise. */
export function writeRecord(reporter: Reporter, record: RuntimeRecord): void {
  if (reporter.json) {
    // A stream gets one JSON object per line, not one document.
    reporter.raw(JSON.stringify(recordPayload(record)))

    return
  }

  const tag = tagFor(record.level, record.event)

  reporter.line(`${tag} ${pc.bold(sourceName(record.event))}  ${record.lines[0] ?? ""}`)

  // The traceback belongs to the line above it, so it is indented under it
  // rather than tagged again as output of its own.
  for (const line of record.lines.slice(1)) {
    reporter.line(pc.dim(`      ${line}`))
  }

  for (const location of record.mapped) {
    reporter.line(pc.dim(`      → ${formatLocation(location, record.ambiguous)}`))
  }
}
