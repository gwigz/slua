import { readFile } from "node:fs/promises"
import { basename, extname, isAbsolute, resolve } from "node:path"
import pc from "picocolors"
import { displayName, type PublishOptions, resolveItem, withStaleRetry } from "../../addressing.js"
import type { ViewerClient } from "../../client.js"
import { type CompileLanguage, parseCompileErrors } from "../../compile-errors.js"
import { ConnectionClosedError } from "../../protocol/errors.js"
import type { ObjectInventoryItem, ScriptVM } from "../../protocol/types.js"
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

export async function pushCommand(
  client: ViewerClient,
  command: Extract<Command, { name: "push" }>,
  reporter: Reporter,
  publish: PublishOptions = {},
): Promise<number> {
  const targets = await collectTargets(command, await loadConfig())
  const results: Record<string, unknown>[] = []

  let failed = 0

  for (const target of targets) {
    try {
      const result = await pushTarget(client, target, reporter, targets.length > 1, publish)

      results.push(result.payload)

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

  reporter.data(targets.length === 1 ? results[0] : { ok: failed === 0, targets: results })

  return failed === 0 ? 0 : 1
}

async function pushTarget(
  client: ViewerClient,
  target: Target,
  reporter: Reporter,
  labelled: boolean,
  publish: PublishOptions,
): Promise<{ ok: boolean; payload: Record<string, unknown> }> {
  const label = labelled ? `${target.name}: ` : ""
  const content = await readFile(target.file, "utf8")

  // Lookup and save retry together: right after a save the viewer rejects the
  // next one as "item not found in prim inventory", and a retry has to start
  // from a fresh listing.
  const { resolved, vm, response } = await withStaleRetry(async () => {
    const found = await resolveItem(client, target.ref, publish)
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
  }

  if (!response?.success) {
    reporter.error(`${label}save failed: ${response?.message ?? "unknown error"}`)

    return {
      ok: false,
      payload: { ok: false, ...base, compiled: false, errors: [], message: response?.message },
    }
  }

  // A save can succeed while the compile fails; the source is stored either way.
  if (response.compiled === false) {
    const language: CompileLanguage = vm === "luau" ? "luau" : "lsl"
    const errors = parseCompileErrors(response.errors, language)
    const sourceMap = await loadSourceMapFor(target.file)
    const payload = await reportCompileErrors(errors, target.file, sourceMap, reporter, base, label)

    return { ok: false, payload }
  }

  reporter.note(
    `${label}${pc.green("compiled")} ${displayName(resolved.item)} in ${resolved.object.objectName}`,
  )

  const savedBack = target.saveBack
    ? await saveBackToContents(client, resolved.object, reporter, label)
    : undefined

  return {
    ok: savedBack !== false,
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
  errors: ReturnType<typeof parseCompileErrors>,
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
    errors: resolved.map(({ error, mapped }) => ({
      ...error,
      source: mapped?.source,
      line: mapped?.line,
    })),
  }
}
