import type { ViewerClient } from "./client.js"
import type {
  LinkedObject,
  ObjectInventoryItem,
  ObjectPublishMessage,
  PublishedObject,
} from "./protocol/types.js"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
  return UUID.test(value)
}

/**
 * How to find an object.
 *
 * A UUID is the most direct but the least durable: taking an object and
 * rezzing it again gives it a new one. Name and description survive that
 * round trip, which makes a description key the stable way to pin a project
 * to an object.
 */
export type ObjectSelector =
  | { kind: "id"; value: string }
  | { kind: "name"; value: string }
  | { kind: "description"; value: string }

/**
 * Parses an object selector.
 *
 * A bare value is a UUID if it looks like one and a name otherwise; the
 * `id:`, `name:` and `desc:` prefixes make the choice explicit.
 */
export function parseObjectSelector(raw: string): ObjectSelector {
  for (const [prefix, kind] of [
    ["id:", "id"],
    ["name:", "name"],
    ["desc:", "description"],
  ] as const) {
    if (raw.startsWith(prefix)) {
      const value = raw.slice(prefix.length)

      if (value === "") throw new Error(`"${raw}" is missing a value after ${prefix}`)

      return { kind, value }
    }
  }

  return isUuid(raw) ? { kind: "id", value: raw } : { kind: "name", value: raw }
}

/**
 * Matches a description key on whitespace boundaries.
 *
 * A plain substring test would let the key `slua:main` match an object
 * described `slua:main-menu`, so any two targets where one name prefixes the
 * other would resolve to the same prim. Keys are stamped space separated
 * alongside whatever else the description holds, so a boundary either side is
 * what tells one apart from the next.
 */
export function descriptionMatches(description: string, value: string): boolean {
  if (value === "") return false

  for (
    let index = description.indexOf(value);
    index !== -1;
    index = description.indexOf(value, index + 1)
  ) {
    const before = index === 0 ? " " : description[index - 1]
    const end = index + value.length
    const after = end === description.length ? " " : description[end]

    if (/\s/.test(before) && /\s/.test(after)) return true
  }

  return false
}

export function formatObjectSelector(selector: ObjectSelector): string {
  return selector.kind === "id"
    ? selector.value
    : `${selector.kind === "description" ? "desc" : "name"}:${selector.value}`
}

export interface ObjectRef {
  object: ObjectSelector
  /** Present only for items inside a child prim. */
  link?: string
  item: string
}

/**
 * Parses `<object>/<item>` or `<object>/<link>/<item>`.
 *
 * `<object>` is an object selector, `<link>` accepts a UUID, link name or link
 * number, and `<item>` accepts an item UUID or its display name (with or
 * without the synthetic extension).
 */
export function parseObjectRef(ref: string): ObjectRef {
  const parts = ref.split("/").filter((part) => part !== "")

  if (parts.length === 2) {
    return { object: parseObjectSelector(parts[0]), item: parts[1] }
  }

  if (parts.length === 3) {
    return { object: parseObjectSelector(parts[0]), link: parts[1], item: parts[2] }
  }

  throw new Error(`expected <object>/<item> or <object>/<link>/<item>, got "${ref}"`)
}

/**
 * The extension the viewer's file view shows for an item.
 *
 * It is synthetic — the SL inventory name never contains it — so it is only
 * ever added for display and tolerated on input.
 */
export function displayExtension(item: ObjectInventoryItem): string {
  if (item.type !== "script") return ""

  return item.subtype === 1 || item.vm === "luau" ? ".luau" : ".lsl"
}

export function displayName(item: ObjectInventoryItem): string {
  return item.name + displayExtension(item)
}

function itemMatches(item: ObjectInventoryItem, needle: string): boolean {
  if (isUuid(needle)) return item.item_id.toLowerCase() === needle.toLowerCase()

  return item.name === needle || displayName(item) === needle
}

function linkMatches(link: LinkedObject, needle: string, ambiguous: boolean): boolean {
  if (isUuid(needle)) return link.link_id.toLowerCase() === needle.toLowerCase()
  if (needle === String(link.link_number)) return true

  // Sibling prims often share a name, so the viewer disambiguates them as
  // "Name (link_number)". Accept both forms.
  if (ambiguous) return needle === `${link.link_name} (${link.link_number})`

  return link.link_name === needle
}

export interface ResolvedItem {
  object: PublishedObject
  /** Root `object_id` for root items, `link_id` for items in a child prim. */
  prim_id: string
  item_id: string
  item: ObjectInventoryItem
}

/** Every prim in a linkset, paired with the `prim_id` its items address. */
export function eachPrim(
  object: PublishedObject,
): { prim_id: string; name: string; inventory: ObjectInventoryItem[] }[] {
  return [
    { prim_id: object.object_id, name: object.object_name, inventory: object.inventory ?? [] },
    ...(object.linked_objects ?? []).map((link) => ({
      prim_id: link.link_id,
      name: link.link_name,
      inventory: link.inventory ?? [],
    })),
  ]
}

/** Finds an item within an already-published object. */
export function findItem(object: PublishedObject, ref: ObjectRef): ResolvedItem {
  if (ref.link !== undefined) {
    const links = object.linked_objects ?? []
    const names = links.map((link) => link.link_name)
    const ambiguous = new Set(names).size !== names.length
    const link = links.find((candidate) => linkMatches(candidate, ref.link!, ambiguous))

    if (!link) {
      throw new Error(`no linked prim "${ref.link}" in ${object.object_name}`)
    }

    const item = (link.inventory ?? []).find((candidate) => itemMatches(candidate, ref.item))

    if (!item) {
      throw new Error(`no item "${ref.item}" in linked prim ${link.link_name}`)
    }

    return { object, prim_id: link.link_id, item_id: item.item_id, item }
  }

  for (const prim of eachPrim(object)) {
    const item = prim.inventory.find((candidate) => itemMatches(candidate, ref.item))

    if (item) {
      return { object, prim_id: prim.prim_id, item_id: item.item_id, item }
    }
  }

  throw new Error(`no item "${ref.item}" in ${object.object_name}`)
}

function findPublished(
  objects: PublishedObject[],
  selector: ObjectSelector,
): PublishedObject | undefined {
  switch (selector.kind) {
    case "id":
      return objects.find(
        (object) => object.object_id.toLowerCase() === selector.value.toLowerCase(),
      )

    case "name":
      return objects.find((object) => object.object_name === selector.value)

    case "description":
      return objects.find((object) =>
        descriptionMatches(object.object_description ?? "", selector.value),
      )
  }
}

/**
 * Returns the object, asking the viewer to publish it if it isn't already.
 *
 * Nothing can be read or written until an object is published, and runtime
 * output is only forwarded for published objects, so every command starts here.
 */
export async function ensurePublished(
  client: ViewerClient,
  selector: ObjectSelector,
  timeoutMs = 15_000,
): Promise<PublishedObject> {
  const { objects } = await client.objectList()
  const existing = findPublished(objects ?? [], selector)

  if (existing) return existing

  // Only a UUID can be requested; the viewer has no way to look an object up
  // by name or description, so those must already be published.
  if (selector.kind !== "id") {
    throw new Error(
      `no published object matching ${formatObjectSelector(selector)} — select it in the viewer to publish it, or target it by UUID`,
    )
  }

  const objectId = selector.value

  // Newer viewers answer object.request with the object inline; older ones
  // acknowledge and follow up with an object.publish notification. Listen
  // before asking, so a fast notification cannot arrive before we are ready.
  let cancel = () => {}

  const published = new Promise<PublishedObject>((resolvePublish, reject) => {
    const timer = setTimeout(() => {
      cancel()
      reject(new Error(`viewer did not publish ${objectId} within ${timeoutMs}ms`))
    }, timeoutMs)

    const off = client.on("object.publish", (message: ObjectPublishMessage) => {
      if (message?.object?.object_id?.toLowerCase() !== objectId.toLowerCase()) return

      cancel()
      resolvePublish(message.object)
    })

    // Both early returns below abandon this promise, so the timer has to go
    // with them or it keeps the process alive for the full timeout.
    cancel = () => {
      clearTimeout(timer)
      off()
    }
  })

  // Nothing awaits `published` on the inline path, so swallow its rejection.
  published.catch(() => {})

  try {
    const response = await client.objectRequest(objectId)

    if (response?.object) {
      cancel()

      return response.object
    }

    if (response?.success === false) {
      cancel()

      throw new Error(
        `viewer refused to publish ${objectId}: ${response.message ?? "unknown error"}`,
      )
    }
  } catch (error) {
    cancel()

    throw error
  }

  return await published
}

/** Publishes if needed, then resolves the item reference. */
export async function resolveItem(
  client: ViewerClient,
  ref: ObjectRef,
  timeoutMs?: number,
): Promise<ResolvedItem> {
  return findItem(await ensurePublished(client, ref.object, timeoutMs), ref)
}
