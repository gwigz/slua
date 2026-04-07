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
 * - **YIELD_HTTP** {@link fetch}
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
 *   const [ok, name] = requestAgentData(ll.GetOwner(), DATA_NAME, 10)
 *
 *   if (ok) {
 *     ll.Say(0, `Hello, ${name}!`)
 *     sleep(2)
 *     ll.Say(0, "Done waiting.")
 *   }
 * })
 * ```
 *
 * @version 0.1.0
 */

// ---------------------------------------------------------------------------
// Core runtime (always included)
// ---------------------------------------------------------------------------

import { spawn } from "../internal/spawn"
import type { YieldResult } from "../internal/with-timeout"

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
  timeout?: number,
): YieldResult<Parameters<LLEventMap[E]>> | Parameters<LLEventMap[E]> {
  const co = coroutine.running()!

  if (timeout !== undefined) {
    let resolved = false

    const handler = LLEvents.on(event, ((...args: any[]) => {
      if (filter && !filter(...(args as Parameters<LLEventMap[E]>))) {
        return
      }

      if (resolved) {
        return
      }

      resolved = true

      LLEvents.off(event, handler)
      LLTimers.off(timer)

      coroutine.resume(co, true, args)
    }) as LLEventMap[E])

    const timer = LLTimers.once(timeout, () => {
      if (resolved) {
        return
      }

      resolved = true

      LLEvents.off(event, handler)

      coroutine.resume(co, false, "timeout")
    })

    return coroutine.yield() as unknown as YieldResult<Parameters<LLEventMap[E]>>
  }

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
export function requestAgentData(id: UUID, type: number, timeout: number) {
  return yieldDataserver(ll.RequestAgentData(id, type), timeout)
}

/**
 * Request a display name and yield until the result arrives.
 *
 * @define YIELD_DATASERVER_DISPLAY_NAME
 */
export function requestDisplayName(id: UUID, timeout: number) {
  return yieldDataserver(ll.RequestDisplayName(id), timeout)
}

/**
 * Request simulator data and yield until the result arrives.
 *
 * @define YIELD_DATASERVER_SIM
 */
export function requestSimulatorData(region: string, type: number, timeout: number) {
  return yieldDataserver(ll.RequestSimulatorData(region, type), timeout)
}

/**
 * Request inventory data and yield until the result arrives.
 *
 * @define YIELD_DATASERVER_INVENTORY
 */
export function requestInventoryData(item: string, timeout: number) {
  return yieldDataserver(ll.RequestInventoryData(item), timeout)
}

/**
 * Read a single notecard line and yield until the result arrives.
 *
 * @define YIELD_DATASERVER_NOTECARD
 */
export function readNotecardLine(name: string, line: number, timeout: number) {
  return yieldDataserver(ll.GetNotecardLine(name, line), timeout)
}

/**
 * Read an entire notecard by fetching lines until EOF.
 * Returns an array of lines.
 *
 * The timeout applies per line, not for the entire read.
 *
 * @define YIELD_DATASERVER_NOTECARD
 */
export function readNotecard(name: string, lineTimeout: number): YieldResult<string[]> {
  const lines: string[] = []
  let lineNum = 0

  while (true) {
    const [ok, data] = readNotecardLine(name, lineNum, lineTimeout)

    if (!ok) {
      return $multi(false, "timeout") as YieldResult<string[]>
    }

    if (data === EOF) {
      break
    }

    lines.push(data as string)
    lineNum++
  }

  return $multi(true, lines) as YieldResult<string[]>
}

/**
 * Search notecard text for a pattern and yield until the count arrives.
 *
 * @define YIELD_DATASERVER_TEXT_COUNT
 */
export function findNotecardTextCount(name: string, pattern: string, opts: list, timeout: number) {
  return yieldDataserver(ll.FindNotecardTextCount(name, pattern, opts), timeout)
}

// ---------------------------------------------------------------------------
// KV store wrappers
// ---------------------------------------------------------------------------

/**
 * Read a key-value pair from the experience KV store.
 *
 * @define YIELD_KV
 */
export function kvRead(key: string, timeout: number): YieldResult<{ ok: boolean; value: string }> {
  const [ok, raw] = yieldDataserver(ll.ReadKeyValue(key), timeout)

  if (!ok) {
    return $multi(false, "timeout") as YieldResult<{ ok: boolean; value: string }>
  }

  const sep = raw.indexOf(",")
  const success = raw.substring(0, sep) === "1"
  const value = raw.substring(sep + 1)

  return $multi(true, { ok: success, value }) as YieldResult<{ ok: boolean; value: string }>
}

/**
 * Create a key-value pair in the experience KV store.
 *
 * @define YIELD_KV
 */
export function kvCreate(key: string, value: string, timeout: number): YieldResult<boolean> {
  const [ok, raw] = yieldDataserver(ll.CreateKeyValue(key, value), timeout)

  if (!ok) {
    return $multi(false, "timeout") as YieldResult<boolean>
  }

  return $multi(true, raw.substring(0, raw.indexOf(",")) === "1") as YieldResult<boolean>
}

/**
 * Update a key-value pair in the experience KV store.
 *
 * @define YIELD_KV
 */
export function kvUpdate(key: string, value: string, timeout: number): YieldResult<boolean> {
  const [ok, raw] = yieldDataserver(ll.UpdateKeyValue(key, value, false, ""), timeout)

  if (!ok) {
    return $multi(false, "timeout") as YieldResult<boolean>
  }

  return $multi(true, raw.substring(0, raw.indexOf(",")) === "1") as YieldResult<boolean>
}

/**
 * Delete a key-value pair from the experience KV store.
 *
 * @define YIELD_KV
 */
export function kvDelete(key: string, timeout: number): YieldResult<boolean> {
  const [ok, raw] = yieldDataserver(ll.DeleteKeyValue(key), timeout)

  if (!ok) {
    return $multi(false, "timeout") as YieldResult<boolean>
  }

  return $multi(true, raw.substring(0, raw.indexOf(",")) === "1") as YieldResult<boolean>
}

/**
 * Get the KV store usage. Returns used and total byte counts.
 *
 * @define YIELD_KV
 */
export function kvSize(timeout: number): YieldResult<{ used: number; total: number }> {
  const [ok, raw] = yieldDataserver(ll.DataSizeKeyValue(), timeout)

  if (!ok) {
    return $multi(false, "timeout") as YieldResult<{ used: number; total: number }>
  }

  const sep = raw.indexOf(",")
  const used = tonumber(raw.substring(0, sep))!
  const total = tonumber(raw.substring(sep + 1))!

  return $multi(true, { used, total }) as YieldResult<{ used: number; total: number }>
}

// ---------------------------------------------------------------------------
// Dialog & TextBox
// ---------------------------------------------------------------------------

/** @internal Open a filtered listener, yield until a message arrives, then clean up. */
function yieldListen(channel: number, avatarId: UUID, timeout: number): YieldResult<string> {
  const co = coroutine.running()!
  let resolved = false

  const handle = ll.Listen(channel, "", avatarId, "")

  const handler = LLEvents.on("listen", (ch: number, _name: string, _id: UUID, msg: string) => {
    if (ch !== channel || resolved) {
      return
    }

    resolved = true

    LLEvents.off("listen", handler)
    LLTimers.off(timer)

    ll.ListenRemove(handle)
    coroutine.resume(co, true, msg)
  })

  const timer = LLTimers.once(timeout, () => {
    if (resolved) {
      return
    }

    resolved = true

    LLEvents.off("listen", handler)

    ll.ListenRemove(handle)
    coroutine.resume(co, false, "timeout")
  })

  return coroutine.yield() as unknown as YieldResult<string>
}

/**
 * Show a dialog to an avatar and yield until they click a button.
 * Returns the button text.
 *
 * @define YIELD_DIALOG
 */
export function dialog(
  channel: number,
  avatarId: UUID,
  text: string,
  buttons: string[],
  timeout: number,
) {
  ll.Dialog(avatarId, text, buttons, channel)

  return yieldListen(channel, avatarId, timeout)
}

/**
 * Show a text box to an avatar and yield until they submit text.
 * Returns the entered text.
 *
 * @define YIELD_DIALOG
 */
export function textBox(channel: number, avatarId: UUID, text: string, timeout: number) {
  ll.TextBox(avatarId, text, channel)

  return yieldListen(channel, avatarId, timeout)
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

/**
 * Send an HTTP request and yield until the response arrives.
 *
 * @define YIELD_HTTP
 */
function yieldFetch(
  url: string,
  options: HttpParamOptions & { timeout: number },
): YieldResult<{ status: number; metadata: list; body: string }> {
  const co = coroutine.running()!
  let resolved = false
  const timeout = options.timeout

  const requestId = httpRequest(url, options)

  const handler = LLEvents.on(
    "http_response",
    (reqId: UUID, status: number, metadata: list, respBody: string) => {
      if (reqId !== requestId || resolved) {
        return
      }

      resolved = true

      LLEvents.off("http_response", handler)
      LLTimers.off(timer)

      coroutine.resume(co, true, { status, metadata, body: respBody })
    },
  )

  const timer = LLTimers.once(timeout, () => {
    if (resolved) {
      return
    }

    resolved = true

    LLEvents.off("http_response", handler)

    coroutine.resume(co, false, "timeout")
  })

  return coroutine.yield() as unknown as YieldResult<{
    status: number
    metadata: list
    body: string
  }>
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

/**
 * Request permissions from an avatar and yield until granted/denied.
 * Returns the granted permission flags.
 *
 * Must not be called concurrently, `run_time_permissions` carries
 * no request ID, so overlapping calls will race.
 *
 * @define YIELD_PERMISSIONS
 */
export function requestPermissions(
  avatarId: UUID,
  mask: number,
  timeout: number,
): YieldResult<number> {
  const co = coroutine.running()!
  let resolved = false

  ll.RequestPermissions(avatarId, mask)

  const handler = LLEvents.on("run_time_permissions", (flags: number) => {
    if (resolved) {
      return
    }

    resolved = true

    LLEvents.off("run_time_permissions", handler)
    LLTimers.off(timer)

    coroutine.resume(co, true, flags)
  })

  const timer = LLTimers.once(timeout, () => {
    if (resolved) {
      return
    }

    resolved = true

    LLEvents.off("run_time_permissions", handler)

    coroutine.resume(co, false, "timeout")
  })

  return coroutine.yield() as unknown as YieldResult<number>
}

/**
 * Transfer Linden dollars to an avatar and yield until the transaction
 * result arrives.
 *
 * @define YIELD_PERMISSIONS
 */
export function transferMoney(
  avatarId: UUID,
  amount: number,
  timeout: number,
): YieldResult<{ success: boolean; message: string }> {
  const co = coroutine.running()!
  let resolved = false

  const requestId = ll.TransferLindenDollars(avatarId, amount)

  const handler = LLEvents.on(
    "transaction_result",
    (reqId: UUID, success: boolean, message: string) => {
      if (reqId !== requestId || resolved) {
        return
      }

      resolved = true

      LLEvents.off("transaction_result", handler)
      LLTimers.off(timer)

      coroutine.resume(co, true, { success, message })
    },
  )

  const timer = LLTimers.once(timeout, () => {
    if (resolved) {
      return
    }

    resolved = true

    LLEvents.off("transaction_result", handler)

    coroutine.resume(co, false, "timeout")
  })

  return coroutine.yield() as unknown as YieldResult<{ success: boolean; message: string }>
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
export function sensor(
  name: string,
  id: UUID,
  type: number,
  range: number,
  arc: number,
  timeout: number,
): YieldResult<DetectedEvent[] | null> {
  const co = coroutine.running()!
  let resolved = false

  ll.Sensor(name, id, type, range, arc)

  let timer: LLTimerCallback

  const cleanup = () => {
    LLEvents.off("sensor", onSensor)
    LLEvents.off("no_sensor", onNoSensor)
    LLTimers.off(timer)
  }

  const onSensor = LLEvents.on("sensor", (detected: DetectedEvent[]) => {
    if (resolved) {
      return
    }

    resolved = true
    cleanup()
    coroutine.resume(co, true, detected)
  })

  const onNoSensor = LLEvents.on("no_sensor", () => {
    if (resolved) {
      return
    }

    resolved = true
    cleanup()
    coroutine.resume(co, true, null)
  })

  timer = LLTimers.once(timeout, () => {
    if (resolved) {
      return
    }

    resolved = true
    cleanup()
    coroutine.resume(co, false, "timeout")
  })

  return coroutine.yield() as unknown as YieldResult<DetectedEvent[] | null>
}

export { yieldFetch as fetch }
