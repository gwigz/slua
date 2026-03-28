/**
 * @module yield
 *
 * Coroutine-based wrappers that flatten SLua's callback APIs into
 * sequential code. Call {@link spawn} to start a coroutine, then use
 * any of the wrapper functions inside it, they yield the coroutine
 * until the result is ready, then return the value directly.
 *
 * Each wrapper category is gated by a compile-time flag so unused
 * code is stripped from the Lua output:
 *
 * - **YIELD_DATASERVER_AGENT** {@link requestAgentData}
 * - **YIELD_DATASERVER_DISPLAY_NAME** {@link requestDisplayName}
 * - **YIELD_DATASERVER_SIM** {@link requestSimulatorData}
 * - **YIELD_DATASERVER_INVENTORY** {@link requestInventoryData}
 * - **YIELD_DATASERVER_NOTECARD** {@link readNotecardLine}, {@link readNotecard}
 * - **YIELD_DATASERVER_TEXT_COUNT** {@link findNotecardTextCount}
 * - **YIELD_KV** {@link kvRead}, {@link kvCreate}, {@link kvUpdate},
 *   {@link kvDelete}, {@link kvSize}
 * - **YIELD_DIALOG** {@link dialog}, {@link textBox}
 * - **YIELD_HTTP** {@link httpRequest}
 * - **YIELD_PERMISSIONS** {@link requestPermissions}, {@link transferMoney}
 * - **YIELD_SENSOR** {@link sensor}
 *
 * @define Set flags via `@gwigz/slua-tstl-plugin` `define` option.
 * Code guarded by a flag set to `false` is stripped at compile time.
 *
 * @example
 * ```ts
 * import { spawn, requestAgentData, sleep } from "@gwigz/slua-modules/yield"
 *
 * spawn(() => {
 *   const name = requestAgentData(ll.GetOwner(), DATA_NAME)
 *   ll.Say(0, `Hello, ${name}!`)
 *   sleep(2)
 *   ll.Say(0, "Done waiting.")
 * })
 * ```
 *
 * @version 0.1.0
 */

// ---------------------------------------------------------------------------
// Core runtime (always included)
// ---------------------------------------------------------------------------

import { spawn } from "../internal/spawn"

/**
 * Run `fn` in a new coroutine. The coroutine starts immediately.
 * Use yield-based wrappers (e.g. {@link sleep}, {@link requestAgentData})
 * inside `fn` to suspend and resume automatically.
 */
export { spawn }

/**
 * Yield the current coroutine until `event` fires (optionally matching
 * a filter predicate). Returns the event arguments as a tuple.
 */
export function waitFor<E extends keyof LLEventMap>(
  event: E,
  filter?: (...args: Parameters<LLEventMap[E]>) => boolean,
): Parameters<LLEventMap[E]> {
  const co = coroutine.running()!

  const handler = LLEvents.on(event, ((...args: any[]) => {
    if (filter && !filter(...(args as Parameters<LLEventMap[E]>))) {
      return
    }

    LLEvents.off(event, handler)

    coroutine.resume(co, args)
  }) as LLEventMap[E])

  return coroutine.yield() as unknown as Parameters<LLEventMap[E]>
}

/**
 * Yield the current coroutine for `seconds` seconds.
 */
export function sleep(seconds: number) {
  const co = coroutine.running()!

  LLTimers.once(seconds, () => coroutine.resume(co))

  coroutine.yield()
}

// ---------------------------------------------------------------------------
// Internal helpers (DCE'd when all callers are stripped)
// ---------------------------------------------------------------------------

import { yieldDataserver } from "../internal/yield-dataserver"

// ---------------------------------------------------------------------------
// Dataserver wrappers
// ---------------------------------------------------------------------------

/**
 * Request agent data and yield until the result arrives.
 *
 * @define YIELD_DATASERVER_AGENT
 */
export function requestAgentData(id: UUID, type: number) {
  return yieldDataserver(ll.RequestAgentData(id, type))
}

/**
 * Request a display name and yield until the result arrives.
 *
 * @define YIELD_DATASERVER_DISPLAY_NAME
 */
export function requestDisplayName(id: UUID) {
  return yieldDataserver(ll.RequestDisplayName(id))
}

/**
 * Request simulator data and yield until the result arrives.
 *
 * @define YIELD_DATASERVER_SIM
 */
export function requestSimulatorData(region: string, type: number) {
  return yieldDataserver(ll.RequestSimulatorData(region, type))
}

/**
 * Request inventory data and yield until the result arrives.
 *
 * @define YIELD_DATASERVER_INVENTORY
 */
export function requestInventoryData(item: string) {
  return yieldDataserver(ll.RequestInventoryData(item))
}

/**
 * Read a single notecard line and yield until the result arrives.
 *
 * @define YIELD_DATASERVER_NOTECARD
 */
export function readNotecardLine(name: string, line: number) {
  return yieldDataserver(ll.GetNotecardLine(name, line))
}

/**
 * Read an entire notecard by fetching lines until EOF.
 * Returns an array of lines.
 *
 * @define YIELD_DATASERVER_NOTECARD
 */
export function readNotecard(name: string) {
  const lines: string[] = []
  let lineNum = 0

  while (true) {
    const data = readNotecardLine(name, lineNum)

    if (data === EOF) break

    lines.push(data as string)
    lineNum++
  }

  return lines
}

/**
 * Search notecard text for a pattern and yield until the count arrives.
 *
 * @define YIELD_DATASERVER_TEXT_COUNT
 */
export function findNotecardTextCount(name: string, pattern: string, opts: list) {
  return yieldDataserver(ll.FindNotecardTextCount(name, pattern, opts))
}

// ---------------------------------------------------------------------------
// KV store wrappers
// ---------------------------------------------------------------------------

/**
 * Read a key-value pair from the experience KV store.
 *
 * @define YIELD_KV
 */
export function kvRead(key: string) {
  const raw = yieldDataserver(ll.ReadKeyValue(key))
  const sep = raw.indexOf(",")
  const ok = raw.substring(0, sep) === "1"
  const value = raw.substring(sep + 1)

  return { ok, value }
}

/**
 * Create a key-value pair in the experience KV store.
 *
 * @define YIELD_KV
 */
export function kvCreate(key: string, value: string) {
  const raw = yieldDataserver(ll.CreateKeyValue(key, value))
  return raw.substring(0, raw.indexOf(",")) === "1"
}

/**
 * Update a key-value pair in the experience KV store.
 *
 * @define YIELD_KV
 */
export function kvUpdate(key: string, value: string) {
  const raw = yieldDataserver(ll.UpdateKeyValue(key, value, 0, ""))

  return raw.substring(0, raw.indexOf(",")) === "1"
}

/**
 * Delete a key-value pair from the experience KV store.
 *
 * @define YIELD_KV
 */
export function kvDelete(key: string) {
  const raw = yieldDataserver(ll.DeleteKeyValue(key))

  return raw.substring(0, raw.indexOf(",")) === "1"
}

/**
 * Get the KV store usage. Returns used and total byte counts.
 *
 * @define YIELD_KV
 */
export function kvSize() {
  const raw = yieldDataserver(ll.DataSizeKeyValue())
  const sep = raw.indexOf(",")
  const used = tonumber(raw.substring(0, sep))!
  const total = tonumber(raw.substring(sep + 1))!

  return { used, total }
}

// ---------------------------------------------------------------------------
// Dialog & TextBox
// ---------------------------------------------------------------------------

/** @internal Open a filtered listener, yield until a message arrives, then clean up. */
function yieldListen(channel: number, avatarId: UUID): string {
  const co = coroutine.running()!
  const handle = ll.Listen(channel, "", avatarId, "")

  const handler = LLEvents.on("listen", (ch: number, _name: string, _id: UUID, msg: string) => {
    if (ch !== channel) {
      return
    }

    LLEvents.off("listen", handler)

    ll.ListenRemove(handle)
    coroutine.resume(co, msg)
  })

  return coroutine.yield() as unknown as string
}

/**
 * Show a dialog to an avatar and yield until they click a button.
 * Returns the button text.
 *
 * @define YIELD_DIALOG
 */
export function dialog(channel: number, avatarId: UUID, text: string, buttons: string[]) {
  ll.Dialog(avatarId, text, buttons, channel)

  return yieldListen(channel, avatarId)
}

/**
 * Show a text box to an avatar and yield until they submit text.
 * Returns the entered text.
 *
 * @define YIELD_DIALOG
 */
export function textBox(channel: number, avatarId: UUID, text: string) {
  ll.TextBox(avatarId, text, channel)

  return yieldListen(channel, avatarId)
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

/**
 * Send an HTTP request and yield until the response arrives.
 *
 * @define YIELD_HTTP
 */
export function httpRequest(url: string, params: list, body: string) {
  const co = coroutine.running()!
  const requestId = ll.HTTPRequest(url, params, body)

  const handler = LLEvents.on(
    "http_response",
    (reqId: UUID, status: number, metadata: list, respBody: string) => {
      if (reqId !== requestId) {
        return
      }

      LLEvents.off("http_response", handler)

      coroutine.resume(co, { status, metadata, body: respBody })
    },
  )

  return coroutine.yield() as unknown as { status: number; metadata: list; body: string }
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

/**
 * Request permissions from an avatar and yield until granted/denied.
 * Returns the granted permission flags.
 *
 * @define YIELD_PERMISSIONS
 */
export function requestPermissions(avatarId: UUID, mask: number) {
  const co = coroutine.running()!

  ll.RequestPermissions(avatarId, mask)

  const handler = LLEvents.on("run_time_permissions", (flags: number) => {
    LLEvents.off("run_time_permissions", handler)
    coroutine.resume(co, flags)
  })

  return coroutine.yield() as unknown as number
}

/**
 * Transfer Linden dollars to an avatar and yield until the transaction
 * result arrives.
 *
 * @define YIELD_PERMISSIONS
 */
export function transferMoney(avatarId: UUID, amount: number) {
  const co = coroutine.running()!
  const requestId = ll.TransferLindenDollars(avatarId, amount)

  const handler = LLEvents.on(
    "transaction_result",
    (reqId: UUID, successInt: number, message: string) => {
      if (reqId !== requestId) {
        return
      }

      LLEvents.off("transaction_result", handler)

      coroutine.resume(co, { success: successInt === 1, message })
    },
  )

  return coroutine.yield() as unknown as { success: boolean; message: string }
}

// ---------------------------------------------------------------------------
// Sensor
// ---------------------------------------------------------------------------

/**
 * Perform a sensor sweep and yield until results arrive.
 * Returns detected objects on success, or `null` if nothing was found.
 *
 * @define YIELD_SENSOR
 */
export function sensor(name: string, id: UUID, type: number, range: number, arc: number) {
  const co = coroutine.running()!
  let resolved = false

  ll.Sensor(name, id, type, range, arc)

  const onSensor = LLEvents.on("sensor", (detected: DetectedEvent[]) => {
    if (resolved) {
      return
    }

    resolved = true

    LLEvents.off("sensor", onSensor)
    LLEvents.off("no_sensor", onNoSensor)

    coroutine.resume(co, detected)
  })

  const onNoSensor = LLEvents.on("no_sensor", () => {
    if (resolved) {
      return
    }

    resolved = true

    LLEvents.off("sensor", onSensor)
    LLEvents.off("no_sensor", onNoSensor)

    coroutine.resume(co)
  })

  return (coroutine.yield() as unknown as DetectedEvent[] | undefined) ?? null
}
