import { readFile, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import pc from "picocolors"
import {
  descriptionMatches,
  displayName,
  eachPrim,
  listPublished,
  PUBLISH_HINT,
  type PublishOptions,
} from "../../addressing.js"
import type { ViewerClient } from "../../client.js"
import type { PublishedObject } from "../../protocol/types.js"
import { CONFIG_FILENAME, loadConfig, readHeaderTagsFor } from "../../targets.js"
import type { Command } from "../args.js"
import type { Reporter } from "../output.js"

/**
 * Pairs a target with the object currently open in the viewer.
 *
 * Object UUIDs do not survive a take and re-rez, so this stamps a key into the
 * object's description, which does, and records that key in slua.json. The
 * pairing then holds even after the object is rezzed afresh.
 */
export async function linkCommand(
  client: ViewerClient,
  command: Extract<Command, { name: "link" }>,
  reporter: Reporter,
  publish: PublishOptions = {},
): Promise<number> {
  const object = await pickObject(client, command.object, publish)
  const key = command.key ?? `slua:${command.target}`
  const file = command.file ?? `dist/${command.target}.slua`

  const config = await loadConfig()
  const root = config?.root ?? process.cwd()

  // If the source already names the item, let it keep owning that; only the
  // object pairing needs recording.
  const header = await readHeaderTagsFor(resolve(root, file))
  const item = command.item ?? header?.item ?? command.target

  if (!hasItem(object, item)) {
    reporter.note(
      pc.yellow(
        `${object.objectName} has no item named "${item}" yet; push will fail until you create it`,
      ),
    )
  }

  const description = object.objectDescription ?? ""
  // Boundary matched, or stamping `slua:main` onto an object already
  // described `slua:main-menu` would look done without writing anything.
  const stamped = descriptionMatches(description, key)

  if (!stamped) {
    const next = description === "" ? key : `${description} ${key}`

    // Descriptions cap at 127 bytes in Second Life, so a multi-byte character
    // costs more than one of them.
    if (Buffer.byteLength(next, "utf8") > 127) {
      reporter.error(
        `"${object.objectName}" has no room in its description for ${key}; shorten it or pass --key`,
      )

      return 1
    }

    const response = await client.objectModify({ primId: object.objectId, description: next })

    if (!response?.success) {
      reporter.error(`could not set the description: ${response?.message ?? "unknown error"}`)

      return 1
    }
  }

  const path = join(root, CONFIG_FILENAME)
  const raw = await readJson(path)

  raw.targets ??= {}
  raw.targets[command.target] = {
    // Keep anything already configured, such as vm or saveBack.
    ...raw.targets[command.target],
    file,
    object: { description: key },
    // Writing this would override the header on every later push.
    ...(command.item === undefined && header?.item !== undefined ? {} : { item }),
  }

  await writeFile(path, `${JSON.stringify(raw, null, 2)}\n`, "utf8")

  reporter.data({
    ok: true,
    target: command.target,
    objectId: object.objectId,
    objectName: object.objectName,
    key,
    item,
    file,
    config: path,
    stamped: !stamped,
  })

  reporter.note(
    `linked ${pc.bold(command.target)} to ${object.objectName} via ${pc.bold(key)}${
      stamped ? pc.dim(" (already stamped)") : ""
    }`,
  )
  reporter.note(pc.dim(`wrote ${path}`))

  return 0
}

async function pickObject(
  client: ViewerClient,
  wanted: string | undefined,
  publish: PublishOptions,
): Promise<PublishedObject> {
  // The viewer publishes only to a client that is already connected, so with
  // --wait this command is what that button publishes to.
  const published = await listPublished(client, publish)

  if (wanted) {
    const match = published.find(
      (object) =>
        object.objectId.toLowerCase() === wanted.toLowerCase() || object.objectName === wanted,
    )

    if (!match) throw new Error(`no published object matching "${wanted}"`)

    return match
  }

  if (published.length === 1) return published[0]

  if (published.length === 0) {
    throw new Error(`no published objects — ${PUBLISH_HINT}`)
  }

  const names = published.map((object) => `  ${object.objectName}  ${object.objectId}`)

  throw new Error(`several objects are published, pick one with --object:\n${names.join("\n")}`)
}

function hasItem(object: PublishedObject, item: string): boolean {
  return eachPrim(object).some((prim) =>
    prim.inventory.some((candidate) => candidate.name === item || displayName(candidate) === item),
  )
}

async function readJson(
  path: string,
): Promise<{ targets?: Record<string, Record<string, unknown>> }> {
  try {
    return JSON.parse(await readFile(path, "utf8"))
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") return {}

    throw error
  }
}
