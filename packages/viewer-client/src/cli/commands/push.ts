import { readFile } from "node:fs/promises"
import { basename, extname, isAbsolute, resolve } from "node:path"
import pc from "picocolors"
import {
  displayName,
  type PublishOptions,
  resolveItem,
  withoutWait,
  withStaleRetry,
} from "../../addressing.js"
import type { ViewerClient } from "../../client.js"
import { type CompileLanguage, diagnosticsFrom } from "../../compile-errors.js"
import { ConnectionClosedError } from "../../protocol/errors.js"
import type {
  Diagnostic,
  ObjectInventoryItem,
  RuntimeDebug,
  RuntimeError,
  ScriptVM,
} from "../../protocol/types.js"
import { loadSourceMapFor, type SourceMap } from "../../sourcemap.js"
import {
  type Config,
  loadConfig,
  type PartialTarget,
  parseHeaderTags,
  readHeaderTagsFor,
  resolveTarget,
  type Target,
} from "../../targets.js"
import type { Command } from "../args.js"
import { displayPath, type Reporter } from "../output.js"
import {
  cursor,
  fromObject,
  loadTargets,
  namesTarget,
  recordPayload,
  type RuntimeRecord,
  type TargetMap,
  toRecord,
  writeRecord,
} from "../runtime-view.js"

/** What we built is a stronger signal than what the item currently is. */
function vmFromExtension(file: string): ScriptVM | undefined {
  switch (extname(file).toLowerCase()) {
    case ".slua":
    case ".luau":
    case ".lua":
      return "luau"

    case ".lsl":
      return "mono"

    default:
      return undefined
  }
}

function vmFromItem(item: ObjectInventoryItem): ScriptVM | undefined {
  if (item.vm) return item.vm

  return item.subtype === 1 ? "luau" : undefined
}

export function resolveVm(
  explicit: ScriptVM | undefined,
  file: string,
  item: ObjectInventoryItem,
): ScriptVM | undefined {
  return explicit ?? vmFromExtension(file) ?? vmFromItem(item)
}

/** Reads source lines on demand so a clean push never touches the disk twice. */
function lineReader() {
  const cache = new Map<string, string[] | undefined>()

  return async (path: string, line: number): Promise<string | undefined> => {
    if (!cache.has(path)) {
      try {
        cache.set(path, (await readFile(path, "utf8")).split("\n"))
      } catch {
        cache.set(path, undefined)
      }
    }

    return cache.get(path)?.[line - 1]
  }
}

/** Works out which targets a `push` invocation refers to. */
export async function collectTargets(
  command: Extract<Command, { name: "push" }>,
  config: Config | undefined,
): Promise<Target[]> {
  const cli: PartialTarget = {
    // A path typed on the command line is relative to where it was typed,
    // not to wherever slua.json happens to sit further up the tree.
    file: command.file === undefined ? undefined : resolve(command.file),
    object: command.ref?.object,
    link: command.ref?.link,
    item: command.ref?.item,
    vm: command.vm,
    saveBack: command.saveBack,
  }

  const names = command.all
    ? Object.keys(config?.targets ?? {})
    : [command.target ?? (command.file ? basename(command.file).replace(/\.[^.]+$/, "") : "")]

  if (command.all && names.length === 0) {
    throw new Error("--all needs a slua.json with at least one target")
  }

  if (command.target && !config?.targets[command.target]) {
    throw new Error(`no target "${command.target}" in slua.json`)
  }

  const targets: Target[] = []

  for (const name of names) {
    const fromConfig = config?.targets[name]

    // The file has to be settled first, since the header lives in the source
    // that produced it.
    const file = cli.file ?? fromConfig?.file

    if (!file) throw new Error(`target "${name}" has no file to push`)

    const resolvedFile = isAbsolute(file) ? file : resolve(config?.root ?? process.cwd(), file)

    targets.push(
      resolveTarget({
        name,
        cli,
        config: fromConfig,
        header: await readHeader(resolvedFile, fromConfig, config),
        configRoot: config?.root,
      }),
    )
  }

  return targets
}

async function readHeader(
  file: string,
  fromConfig: PartialTarget | undefined,
  config: Config | undefined,
): Promise<PartialTarget | undefined> {
  // An explicit entry skips the source map lookup entirely.
  if (fromConfig?.entry) {
    const entry = isAbsolute(fromConfig.entry)
      ? fromConfig.entry
      : resolve(config?.root ?? process.cwd(), fromConfig.entry)

    return parseHeaderTags(await readFile(entry, "utf8"), entry)
  }

  return await readHeaderTagsFor(file)
}

/** The object and item one pushed target's output will name. */
export interface PushScope {
  objectId: string
  primId: string
  item: string
}

/**
 * Collects the runtime output a push produces.
 *
 * A save restarts the script, so whatever its `state_entry` says is on the
 * wire before the save call has even returned. Without something listening
 * across that gap the output lands on a closed socket and is gone, which is
 * the whole reason this exists.
 */
interface Drain {
  /** Scopes the drain to a target the push resolved. */
  add(scope: PushScope): void
  /** Waits the window out, printing the result document at the right moment. */
  settle(document: Record<string, unknown>): Promise<void>
}

function startDrain(
  client: ViewerClient,
  reporter: Reporter,
  maps: TargetMap[],
  tail: number | "forever",
): Drain {
  const buffered: RuntimeRecord[] = []
  const ids = new Set<string>()
  const items = new Set<string>()

  let deliver: ((record: RuntimeRecord) => void) | undefined

  const receive = (level: "debug" | "error", params: RuntimeDebug | RuntimeError) => {
    const record = toRecord(level, params, maps)

    // Held until the pushes name what they touched, since output can arrive
    // before the save call that caused it has even returned.
    if (deliver) deliver(record)
    else buffered.push(record)
  }

  // IMPORTANT: subscribed before the first save, not after it. The script
  // restarts the moment the save lands, so a subscription set up afterwards
  // has already missed its startup output. Do not move this below the push.
  const unsubscribe = [
    client.on("runtime.debug", (params) => receive("debug", params)),
    client.on("runtime.error", (params) => receive("error", params)),
  ]

  const wanted = (record: RuntimeRecord) =>
    fromObject(record.event, ids) && namesTarget(record.event, items)

  /** Resolves when the window closes, the socket drops, or ctrl-c arrives. */
  const window = () =>
    new Promise<void>((done) => {
      const finish = () => {
        clearTimeout(timer)
        offClose()
        process.off("SIGINT", finish)
        done()
      }

      const timer = tail === "forever" ? undefined : setTimeout(finish, tail)
      const offClose = client.connection.onClose(finish)

      if (tail === "forever") {
        reporter.note(pc.dim("tailing output, press ctrl-c to stop"))
        process.on("SIGINT", finish)
      }
    })

  return {
    add(scope) {
      ids.add(scope.objectId)
      ids.add(scope.primId)
      items.add(scope.item.toLowerCase())
    },

    async settle(document) {
      // Nothing resolved, so there is no object whose output this could be.
      if (ids.size === 0) {
        for (const off of unsubscribe) off()

        reporter.data(document)

        return
      }

      // Under --json the document has to come out whole, so a bounded drain
      // collects rather than prints. An unbounded one cannot wait for an end
      // that never comes, so it prints the document first and then streams,
      // the same exception `logs --json` already makes.
      const collect = reporter.json && tail !== "forever"
      const logs: Record<string, unknown>[] = []

      deliver = (record) => {
        if (!wanted(record)) return

        if (collect) logs.push(recordPayload(record))
        else writeRecord(reporter, record)
      }

      if (!collect) reporter.data(document)

      for (const record of buffered.splice(0)) deliver(record)

      await window()

      for (const off of unsubscribe) off()

      if (collect) reporter.data({ ...document, logs })
    },
  }
}

export async function pushCommand(
  client: ViewerClient,
  command: Extract<Command, { name: "push" }>,
  reporter: Reporter,
  publish: PublishOptions = {},
): Promise<number> {
  const targets = await collectTargets(command, await loadConfig())
  const results: Record<string, unknown>[] = []
  const tail = command.tail ?? 0

  // Source maps bring the drained output home to TypeScript, the same way
  // `logs` does. Loaded before the drain so the first record already maps.
  const drain =
    tail === 0 ? undefined : startDrain(client, reporter, (await loadTargets()).maps, tail)

  let failed = 0

  for (const target of targets) {
    try {
      const result = await pushTarget(client, target, reporter, targets.length > 1, publish)

      results.push(result.payload)

      if (result.scope) drain?.add(result.scope)
      if (!result.ok) failed++
    } catch (error) {
      // A dead connection will not improve for the next target, and a single
      // target reads better through the CLI's own error advice.
      if (error instanceof ConnectionClosedError || targets.length === 1) throw error

      // Otherwise one unreachable object must not strand the targets behind
      // it, nor rob a --json consumer of its result document.
      const message = error instanceof Error ? error.message : String(error)

      reporter.error(`${target.name}: ${message}`)
      results.push({ ok: false, target: target.name, compiled: false, errors: [], message })
      failed++
    }
  }

  const document = targets.length === 1 ? results[0]! : { ok: failed === 0, targets: results }

  // One drain at the end, scoped to every target it touched, rather than one
  // window per target: `push --all` would otherwise wait once per script.
  if (drain) await drain.settle(document)
  else reporter.data(document)

  return failed === 0 ? 0 : 1
}

/**
 * Deploys one target and reports what happened.
 *
 * Exported for `connect`, which pushes on a watch event and must go through
 * exactly this path: the stale-listing retry, the vm inference and the mapped
 * diagnostics are not worth having twice.
 */
export async function pushTarget(
  client: ViewerClient,
  target: Target,
  reporter: Reporter,
  labelled: boolean,
  publish: PublishOptions,
): Promise<{ ok: boolean; payload: Record<string, unknown>; scope?: PushScope }> {
  const label = labelled ? `${target.name}: ` : ""
  const content = await readFile(target.file, "utf8")

  // Taken before the save, so it names the point everything this push causes
  // comes after. `logs --since` keys off it.
  const from = cursor()

  // Lookup and save retry together: right after a save the viewer rejects the
  // next one as "item not found in prim inventory", and a retry has to start
  // from a fresh listing. Only the first lookup waits on the publish button,
  // since a retry is for a listing that settles in milliseconds.
  const { resolved, vm, response } = await withStaleRetry(async (attempt) => {
    const found = await resolveItem(
      client,
      target.ref,
      attempt === 0 ? publish : withoutWait(publish),
    )
    const compileAs = resolveVm(target.vm, target.file, found.item)

    return {
      resolved: found,
      vm: compileAs,
      response: await client.objectContentSave({
        primId: found.primId,
        itemId: found.itemId,
        content,
        vm: compileAs,
        // Preserve the script's current state rather than silently starting it.
        running: found.item.type === "script" ? found.item.running : undefined,
      }),
    }
  })

  const base = {
    target: target.name,
    objectId: resolved.object.objectId,
    primId: resolved.primId,
    itemId: resolved.itemId,
    item: resolved.item.name,
    vm,
    cursor: from,
  }

  const scope: PushScope = {
    objectId: resolved.object.objectId,
    primId: resolved.primId,
    item: resolved.item.name,
  }

  if (!response?.success) {
    reporter.error(`${label}save failed: ${response?.message ?? "unknown error"}`)

    return {
      ok: false,
      scope,
      payload: { ok: false, ...base, compiled: false, errors: [], message: response?.message },
    }
  }

  // A save can succeed while the compile fails; the source is stored either way.
  if (response.compiled === false) {
    const language: CompileLanguage = vm === "luau" ? "luau" : "lsl"
    const errors = diagnosticsFrom(response, language)
    const sourceMap = await loadSourceMapFor(target.file)
    const payload = await reportCompileErrors(errors, target.file, sourceMap, reporter, base, label)

    return { ok: false, scope, payload }
  }

  reporter.note(
    `${label}${pc.green("compiled")} ${displayName(resolved.item)} in ${resolved.object.objectName}`,
  )

  const savedBack = target.saveBack
    ? await saveBackToContents(client, resolved.object, reporter, label)
    : undefined

  return {
    ok: savedBack !== false,
    scope,
    payload: {
      ok: savedBack !== false,
      ...base,
      compiled: true,
      errors: [],
      savedBack: savedBack,
    },
  }
}

/**
 * Derezzes the object back into the prim it was rezzed from.
 *
 * Only objects rezzed out of another in-world prim's contents can do this, and
 * the viewer decides that from the selection at publish time, so an object
 * published by UUID alone will report `canSaveBack: false`.
 */
async function saveBackToContents(
  client: ViewerClient,
  object: { objectId: string; canSaveBack?: boolean },
  reporter: Reporter,
  label: string,
): Promise<boolean> {
  if (object.canSaveBack === false) {
    reporter.error(
      `${label}save-back unavailable: the viewer only offers it for an object rezzed from another object's contents, and only while it is selected`,
    )

    return false
  }

  const response = await client.executeCommand("viewer.object.save_back_to_contents", {
    objectId: object.objectId,
  })

  if (!response?.success) {
    reporter.error(`${label}save-back failed: ${response?.message ?? "unknown error"}`)

    return false
  }

  reporter.note(`${label}${pc.green("saved back")} to source object contents`)

  return true
}

async function reportCompileErrors(
  errors: readonly Diagnostic[],
  file: string,
  sourceMap: SourceMap | undefined,
  reporter: Reporter,
  base: Record<string, unknown>,
  label: string,
): Promise<Record<string, unknown>> {
  const readLine = lineReader()

  const resolved = errors.map((error) => {
    // Compile errors point at generated Lua; map them home when we can.
    const mapped = error.row > 0 ? sourceMap?.mapRow(error.row) : undefined

    return {
      error,
      file: mapped?.source ?? file,
      row: mapped?.line ?? error.row,
      mapped,
    }
  })

  if (!sourceMap) {
    reporter.note(
      pc.dim("no source map beside the pushed file; lines refer to the generated output"),
    )
  }

  for (const { error, file: source, row } of resolved) {
    const where = row > 0 ? `${displayPath(source)}:${row}` : displayPath(source)

    reporter.error(`${label}${where}: ${error.message}`)

    const text = row > 0 ? await readLine(source, row) : undefined

    if (text !== undefined) {
      reporter.note(pc.dim(`  ${text.trimEnd()}`))
    }
  }

  return {
    ok: false,
    ...base,
    compiled: false,
    mapped: sourceMap !== undefined,
    // oxlint-disable-next-line no-map-spread -- builds a new payload per error, no accumulator
    errors: resolved.map(({ error, mapped }) => ({
      ...error,
      source: mapped?.source,
      line: mapped?.line,
    })),
  }
}
