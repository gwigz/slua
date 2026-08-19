import type { ViewerClient } from "./client.js"
import { ConnectionClosedError, RpcError, RpcErrorCode } from "./protocol/errors.js"
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
  if (isUuid(needle)) return item.itemId.toLowerCase() === needle.toLowerCase()

  return item.name === needle || displayName(item) === needle
}

function linkMatches(link: LinkedObject, needle: string, ambiguous: boolean): boolean {
  if (isUuid(needle)) return link.linkId.toLowerCase() === needle.toLowerCase()
  if (needle === String(link.linkNumber)) return true

  // Sibling prims often share a name, so the viewer disambiguates them as
  // "Name (linkNumber)". Accept both forms.
  if (ambiguous) return needle === `${link.linkName} (${link.linkNumber})`

  return link.linkName === needle
}

export interface ResolvedItem {
  object: PublishedObject
  /** Root `objectId` for root items, `linkId` for items in a child prim. */
  primId: string
  itemId: string
  item: ObjectInventoryItem
}

/** Every prim in a linkset, paired with the `primId` its items address. */
export function eachPrim(
  object: PublishedObject,
): { primId: string; name: string; inventory: ObjectInventoryItem[] }[] {
  return [
    { primId: object.objectId, name: object.objectName, inventory: object.inventory ?? [] },
    ...(object.linkedObjects ?? []).map((link) => ({
      primId: link.linkId,
      name: link.linkName,
      inventory: link.inventory ?? [],
    })),
  ]
}

/** Finds an item within an already-published object. */
export function findItem(object: PublishedObject, ref: ObjectRef): ResolvedItem {
  if (ref.link !== undefined) {
    const links = object.linkedObjects ?? []
    const names = links.map((link) => link.linkName)
    const ambiguous = new Set(names).size !== names.length
    const link = links.find((candidate) => linkMatches(candidate, ref.link!, ambiguous))

    if (!link) {
      throw new Error(`no linked prim "${ref.link}" in ${object.objectName}`)
    }

    const item = (link.inventory ?? []).find((candidate) => itemMatches(candidate, ref.item))

    if (!item) {
      throw new Error(`no item "${ref.item}" in linked prim ${link.linkName}`)
    }

    return { object, primId: link.linkId, itemId: item.itemId, item }
  }

  for (const prim of eachPrim(object)) {
    const item = prim.inventory.find((candidate) => itemMatches(candidate, ref.item))

    if (item) {
      return { object, primId: prim.primId, itemId: item.itemId, item }
    }
  }

  throw new Error(`no item "${ref.item}" in ${object.objectName}`)
}

/** Whether a published object answers to a selector. */
export function matchesSelector(object: PublishedObject, selector: ObjectSelector): boolean {
  switch (selector.kind) {
    case "id":
      return object.objectId.toLowerCase() === selector.value.toLowerCase()

    case "name":
      return object.objectName === selector.value

    case "description":
      return descriptionMatches(object.objectDescription ?? "", selector.value)
  }
}

function findPublished(
  objects: PublishedObject[],
  selector: ObjectSelector,
): PublishedObject | undefined {
  return objects.find((object) => matchesSelector(object, selector))
}

/**
 * What actually publishes an object to us.
 *
 * Selecting an object does nothing on its own: publishing is the Content tab's
 * "Explore in IDE" button, and the viewer only publishes there when an editor
 * client is already connected — with none, it launches an external editor
 * instead. So the connection has to be waiting before the button is pressed,
 * which is what `--wait` is for.
 */
export const PUBLISH_ACTION =
  'open the object\'s Build window, go to Content and press "Explore in IDE"'

/** The same, said tersely to someone whose command just failed for want of it. */
export const PUBLISH_HINT =
  'publish from the viewer with Build > Content > "Explore in IDE" while a command holds the connection open with --wait, or address an object by UUID to have it published on demand'

/** How long an `object.request` has to come back. */
const REQUEST_TIMEOUT_MS = 15_000

/** How long `--wait` holds the connection open for the publish button. */
export const PUBLISH_WAIT_MS = 300_000

/**
 * Delays before re-reading the object list.
 *
 * The viewer's published inventory goes briefly stale right after a content
 * save: the item, and sometimes the whole object, drops out of `object.list`
 * for a moment before settling. A second look succeeds, so this short ladder
 * is the difference between `push --all` working and failing on whichever
 * target follows a save.
 */
const LOOKUP_RETRY_MS = [150, 300, 600]

/**
 * Whether an error is the viewer's prim inventory still settling.
 *
 * The same window that empties a listing also makes a call naming the item
 * fail: `object.content.save` comes back as invalid params with "Item not
 * found in prim inventory", though the item is there and its id has not
 * changed. Seen roughly one push in five when pushing repeatedly.
 */
export function isStaleInventory(error: unknown): boolean {
  return (
    error instanceof RpcError &&
    error.code === RpcErrorCode.InvalidParams &&
    /not found in (prim )?inventory/i.test(error.message)
  )
}

/**
 * Runs `fn`, retrying while the viewer's inventory is still settling.
 *
 * Wrap the lookup and the call together, so a retry re-reads the object rather
 * than trying the same call against the same stale answer.
 */
export async function withStaleRetry<T>(fn: (attempt: number) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt)
    } catch (error) {
      if (!isStaleInventory(error) || attempt >= LOOKUP_RETRY_MS.length) throw error

      await new Promise((sleep) => setTimeout(sleep, LOOKUP_RETRY_MS[attempt]))
    }
  }
}

/**
 * The same options with the wait dropped.
 *
 * A stale-inventory retry is for a listing that settles in milliseconds, so it
 * must not sit on the publish button's 300 second wait.
 */
export function withoutWait(options: PublishOptions): PublishOptions {
  return { ...options, waitMs: undefined, onWait: undefined }
}

export interface PublishOptions {
  /** How long to wait for an `object.request` to be honoured. */
  timeoutMs?: number
  /**
   * Wait this long for the viewer to publish a match rather than failing.
   *
   * Holding the connection open is the only way the viewer's publish button
   * reaches us at all, so this is how a name or description target is meant to
   * be used interactively.
   */
  waitMs?: number
  /** Called once when a wait begins, so a caller can say what it is waiting for. */
  onWait?: (message: string) => void
}

/** Resolves on the next `object.publish` the predicate accepts. */
function watchPublish(
  client: ViewerClient,
  matches: (object: PublishedObject) => boolean,
  timeoutMs: number,
  what: string,
): { published: Promise<PublishedObject>; cancel: () => void } {
  let cancel = () => {}

  const published = new Promise<PublishedObject>((resolvePublish, reject) => {
    const timer = setTimeout(() => {
      cancel()
      reject(new Error(`viewer did not publish ${what} within ${timeoutMs}ms`))
    }, timeoutMs)

    const off = client.on("object.publish", (message: ObjectPublishMessage) => {
      if (!message?.object || !matches(message.object)) return

      cancel()
      resolvePublish(message.object)
    })

    // Every path that abandons this promise runs `cancel`, or the timer would
    // keep the process alive for its full duration.
    cancel = () => {
      clearTimeout(timer)
      off()
    }
  })

  return { published, cancel: () => cancel() }
}

function waitForPublish(client: ViewerClient, selector: ObjectSelector, timeoutMs: number) {
  return watchPublish(
    client,
    (object) => matchesSelector(object, selector),
    timeoutMs,
    formatObjectSelector(selector),
  )
}

/** A publish subscription, and the means to drop it again. */
export interface PublishWatcher {
  published: Promise<PublishedObject>
  cancel: () => void
}

/**
 * Waits for the viewer to publish anything at all.
 *
 * For commands that take no target, where the point of waiting is to be
 * connected when the publish button is pressed. Cancellable, so a caller can
 * subscribe before deciding whether it needs to wait at all.
 */
export function waitForAnyPublish(client: ViewerClient, timeoutMs: number): PublishWatcher {
  return watchPublish(client, () => true, timeoutMs, "an object")
}

/**
 * Lists published objects, holding the connection open under `--wait`.
 *
 * The viewer only publishes to a client that is already connected, so an empty
 * listing under `--wait` means waiting for the publish button rather than
 * giving up. The watcher subscribes before the listing that decides whether to
 * wait, since a publish landing between the two would otherwise be missed.
 */
export async function listPublished(
  client: ViewerClient,
  options: PublishOptions = {},
): Promise<PublishedObject[]> {
  if (!options.waitMs) return (await client.objectList()).objects ?? []

  const { published, cancel } = waitForAnyPublish(client, options.waitMs)

  // Nothing awaits it when the listing is already populated, so swallow the
  // timeout rather than leave it unhandled.
  published.catch(() => {})

  let list: PublishedObject[]

  try {
    list = (await client.objectList()).objects ?? []
  } catch (error) {
    cancel()

    throw error
  }

  if (list.length > 0) {
    cancel()

    return list
  }

  options.onWait?.("waiting for an object")

  const object = await published

  // Re-list rather than trust the one notification: a publish can carry
  // several objects, and the listing is what callers read.
  const settled = (await client.objectList()).objects ?? []

  return settled.length > 0 ? settled : [object]
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
  options: PublishOptions = {},
): Promise<PublishedObject> {
  const { objects } = await client.objectList()
  const existing = findPublished(objects ?? [], selector)

  if (existing) return existing

  // Only a UUID can be requested; the viewer has no way to look an object up
  // by name or description, so those have to be published from the viewer.
  if (selector.kind !== "id") {
    if (!options.waitMs) {
      throw new Error(
        `no published object matching ${formatObjectSelector(selector)} — ${PUBLISH_HINT}`,
      )
    }

    options.onWait?.(`waiting for ${formatObjectSelector(selector)}`)

    return await waitForPublish(client, selector, options.waitMs).published
  }

  const objectId = selector.value

  // Newer viewers answer object.request with the object inline; older ones
  // acknowledge and follow up with an object.publish notification. Listen
  // before asking, so a fast notification cannot arrive before we are ready.
  const { published, cancel } = waitForPublish(
    client,
    selector,
    options.timeoutMs ?? REQUEST_TIMEOUT_MS,
  )

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

/**
 * Publishes if needed, then resolves the item reference.
 *
 * Retries a stale listing, since the viewer's inventory is briefly out of date
 * after a save; see `LOOKUP_RETRY_MS`.
 */
export async function resolveItem(
  client: ViewerClient,
  ref: ObjectRef,
  options: PublishOptions = {},
): Promise<ResolvedItem> {
  for (let attempt = 0; ; attempt++) {
    try {
      // Only the first attempt waits on the viewer: the retries exist for a
      // listing that settles in milliseconds, not for a missing object.
      const object = await ensurePublished(
        client,
        ref.object,
        attempt === 0 ? options : withoutWait(options),
      )

      return findItem(object, ref)
    } catch (error) {
      // A closed connection will not have improved by the next look.
      if (error instanceof ConnectionClosedError || attempt >= LOOKUP_RETRY_MS.length) throw error

      await new Promise((sleep) => setTimeout(sleep, LOOKUP_RETRY_MS[attempt]))
    }
  }
}
