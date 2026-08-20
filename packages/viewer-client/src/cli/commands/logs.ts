import { isAbsolute, resolve } from "node:path"
import pc from "picocolors"
import {
  eachPrim,
  ensurePublished,
  parseObjectSelector,
  PUBLISH_HINT,
  type PublishOptions,
  type PublishWatcher,
  waitForAnyPublish,
} from "../../addressing.js"
import { ViewerClient } from "../../client.js"
import type {
  ObjectUpdateMessage,
  PublishedObject,
  RuntimeDebug,
  RuntimeError,
} from "../../protocol/types.js"
import { loadSourceMapFor, type SourceMap } from "../../sourcemap.js"
import { loadConfig } from "../../targets.js"
import type { Command, GlobalFlags } from "../args.js"
import { displayPath, type Reporter } from "../output.js"

const RECONNECT_BASE_MS = 1_000
const RECONNECT_MAX_MS = 30_000

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
 * which is not a file anyone wrote, so the same maps that bring compile errors
 * home are worth having here too. The item names are what `--targets` filters
 * on, and a target without a source map still counts for that.
 */
async function loadTargets(): Promise<Targets> {
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
 * The viewer reports the error as `lua_script:4: message` and each traceback
 * frame as a bare `lua_script:4`, so both shapes count. Anchoring the row to
 * the start of the line, and requiring a colon or the line's end after it,
 * keeps ordinary output like `http:80 responded` from reading as a position.
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
 * A viewer advertising `unifiedDiagnostics` names the item its output came
 * from, so a row that several targets' maps happen to cover need no longer be
 * reported against all of them. An event with no item, or one naming an item
 * no target claims, still falls back to every map.
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
 * linkset's root and the speaking prim as `primId`; an older one puts the
 * speaking prim in `objectId` alone, so a script in a child prim never names
 * the root at all. Listing every prim matches both.
 */
export function objectIds(object: PublishedObject): Set<string> {
  return new Set(eachPrim(object).map((prim) => prim.primId))
}

/** Adds any prims an update brought with it. */
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
 * output is kept rather than quietly dropped. `logs` says so once instead.
 */
export function namesTarget(params: RuntimeDebug, items: Set<string>): boolean {
  const script = params.item?.name

  if (!script) return true

  return items.has(script.toLowerCase())
}

export function mapRow(row: number, maps: TargetMap[]): MappedLocation[] {
  if (row <= 0) return []

  return maps.flatMap(({ name, map }) => {
    const location = map.mapRow(row)

    return location ? [{ target: name, source: location.source, line: location.line }] : []
  })
}

/**
 * Nothing here names the script that produced the output, so a row can map
 * through more than one target's map. Naming the target keeps that honest
 * rather than picking one and hoping.
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
 * The message is the whole raw chat line and carries the traceback with it,
 * so it wins over the viewer's extracted `error`. On a viewer without
 * `unifiedDiagnostics` both that and `line` arrive empty, and the detail
 * follows as a separate `runtime.debug` message, so an error would otherwise
 * print as a bare object name and nothing else.
 */
export function runtimeText(params: RuntimeDebug | RuntimeError, level: "debug" | "error"): string {
  const { error = "", line = 0, column = 0 } = params as RuntimeError
  const text = params.message || error

  if (text) {
    if (line <= 0) return text

    // The text usually names the line itself, as `lua_script:4: ...`, but it
    // never names the column, so suppressing the whole position would lose a
    // column the viewer went to the trouble of reporting.
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
 * The viewer packs the error text and its traceback into a single multi-line
 * message, so a line at a time is the only way to find the positions in it.
 * Locations are deduplicated because the error line and its first traceback
 * frame report the same row.
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
 * The tag a line carries.
 *
 * `owner_say` is the script talking to its owner rather than debug output,
 * and the two are indistinguishable without the channel the viewer now sends.
 */
export function tagFor(level: "debug" | "error", params: RuntimeDebug): string {
  if (level === "error") return pc.red("error")

  return params.channel === "owner_say" ? pc.dim("say") : pc.dim("debug")
}

/**
 * Who produced a line.
 *
 * The same `object/item` addressing the other commands take, so a name read
 * out of the stream can be pasted straight into a `pull` or a `push`. The
 * item half needs a viewer advertising `unifiedDiagnostics`.
 */
export function sourceName(params: RuntimeDebug): string {
  const object = params.objectName || params.objectId
  const script = params.item?.name

  return script ? `${object}/${script}` : object
}

function emit(
  reporter: Reporter,
  level: "debug" | "error",
  params: RuntimeDebug | RuntimeError,
  maps: TargetMap[],
) {
  const scoped = mapsFor(params, maps)
  const { lines, mapped } = runtimeLines(params, level, scoped)

  if (reporter.json) {
    // A stream gets one JSON object per line, not one document.
    process.stdout.write(`${JSON.stringify({ level, ...params, mapped })}\n`)

    return
  }

  const tag = tagFor(level, params)
  const ambiguous = scoped.length > 1

  reporter.line(`${tag} ${pc.bold(sourceName(params))}  ${lines[0] ?? ""}`)

  // The traceback belongs to the line above it, so it is indented under it
  // rather than tagged again as output of its own.
  for (const line of lines.slice(1)) {
    reporter.line(pc.dim(`      ${line}`))
  }

  for (const location of mapped) {
    reporter.line(pc.dim(`      → ${formatLocation(location, ambiguous)}`))
  }
}

/** One connection's worth of streaming. Resolves when the connection drops. */
async function streamOnce(
  global: GlobalFlags,
  command: Extract<Command, { name: "logs" }>,
  reporter: Reporter,
  targets: Targets,
  publish: PublishOptions,
): Promise<ViewerClient> {
  const client = await ViewerClient.connect({ port: global.port, timeoutMs: global.timeoutMs })

  // The viewer forwards every published object's output to every connection,
  // so naming one object only narrows the stream if we do it here. Unset until
  // the object resolves below, which lets output produced while the viewer is
  // still publishing through rather than swallowing it.
  let ids: Set<string> | undefined

  const wanted = (params: RuntimeDebug): boolean => {
    if (ids && !fromObject(params, ids)) return false

    return !command.targets || namesTarget(params, targets.items)
  }

  // Registered before the round trips below, so output produced while the
  // viewer is publishing still reaches the stream.
  client.on("runtime.debug", (params) => {
    if (wanted(params)) emit(reporter, "debug", params, targets.maps)
  })

  client.on("runtime.error", (params) => {
    if (wanted(params)) emit(reporter, "error", params, targets.maps)
  })

  // The linkset can grow while the stream runs, and a script in a prim linked
  // after the listing would otherwise read as somebody else's output.
  client.on("object.update", (params) => {
    if (ids?.has(params.objectId)) ids = withUpdate(ids, params)
  })

  client.on("object.publish", (params) => {
    if (ids?.has(params.object.objectId)) ids = objectIds(params.object)
  })

  if (command.targets && client.connection.handshake?.features.unifiedDiagnostics !== true) {
    reporter.note(
      pc.yellow(
        "--targets needs a viewer that names the item its output came from; showing everything",
      ),
    )
  }

  let watcher: PublishWatcher | undefined

  try {
    // Runtime output is only forwarded for objects the viewer has published, so
    // asking for one up front is the difference between output and silence.
    if (command.object) {
      const object = await ensurePublished(client, parseObjectSelector(command.object), publish)

      ids = objectIds(object)

      reporter.note(pc.dim(`watching ${object.objectName} (${object.objectId})`))
    } else {
      // Subscribed before the listing that decides whether to wait, since a
      // publish landing between the two would otherwise be missed.
      watcher = publish.waitMs ? waitForAnyPublish(client, publish.waitMs) : undefined

      // Nothing awaits it when something is already published, so swallow the
      // timeout rather than leave it unhandled.
      watcher?.published.catch(() => {})

      // With nothing published there is nothing to forward, so either wait for
      // the viewer to publish or say why the stream will stay silent.
      if ((await client.objectList()).objects?.length) {
        watcher?.cancel()
      } else if (watcher) {
        publish.onWait?.("waiting for an object")

        const object = await watcher.published

        reporter.note(pc.dim(`watching ${object.objectName} (${object.objectId})`))
      } else {
        reporter.note(
          pc.yellow(
            `no published objects — runtime output is only forwarded for published objects, so ${PUBLISH_HINT}`,
          ),
        )
      }
    }
  } catch (error) {
    // The socket is open from here on, and an open socket keeps the event loop
    // alive, so a failed setup would hang rather than report and exit.
    watcher?.cancel()
    client.close()

    throw error
  }

  return client
}

export async function logsCommand(
  global: GlobalFlags,
  command: Extract<Command, { name: "logs" }>,
  reporter: Reporter,
  publish: PublishOptions = {},
): Promise<number> {
  const targets = await loadTargets()

  if (command.targets && targets.items.size === 0) {
    throw new Error("--targets needs a slua.json with targets that name an item")
  }

  let attempt = 0
  let stopping = false
  let current: ViewerClient | undefined

  // Removed on the way out, or a caller that runs this more than once would
  // stack a handler per call.
  const interrupt = () => {
    stopping = true
    current?.close()
    process.exit(0)
  }

  process.on("SIGINT", interrupt)

  try {
    // oxlint-disable-next-line no-unmodified-loop-condition -- set by the SIGINT handler above
    while (!stopping) {
      try {
        current = await streamOnce(global, command, reporter, targets, publish)
        attempt = 0

        await new Promise<void>((resolveClosed) => {
          current!.connection.onClose(() => resolveClosed())
          current!.connection.peer.on("session.disconnect", () => resolveClosed())
        })

        // A `session.disconnect` can arrive with the socket still open, so the
        // old client goes before a replacement takes its place. Already-closed
        // connections ignore this.
        current.close()
      } catch (error) {
        if (!command.follow) throw error

        reporter.note(pc.dim(`disconnected: ${error instanceof Error ? error.message : error}`))
      }

      if (!command.follow || stopping) break

      // Back off so a viewer that is closed or restarting isn't hammered.
      const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt++, RECONNECT_MAX_MS)

      reporter.note(pc.dim(`reconnecting in ${Math.round(delay / 1000)}s`))

      await new Promise((sleep) => setTimeout(sleep, delay))
    }
  } finally {
    process.off("SIGINT", interrupt)
  }

  current?.close()

  return 0
}
