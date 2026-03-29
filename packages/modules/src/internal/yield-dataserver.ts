import type { YieldResult } from "./with-timeout"

/**
 * @internal Shared dataserver yield pattern with timeout.
 *
 * Registers a handler filtered by request ID, yields, returns
 * `[true, data]` on success or `[false, "timeout"]` on timeout.
 *
 * Used by both `config` and `yield` modules.
 */
export function yieldDataserver(requestId: UUID, timeout: number): YieldResult<string> {
  const co = coroutine.running()!
  let resolved = false

  const handler = LLEvents.on("dataserver", (reqId: UUID, data: string) => {
    if (reqId !== requestId || resolved) return

    resolved = true

    LLEvents.off("dataserver", handler)
    LLTimers.off(timer)

    coroutine.resume(co, true, data)
  })

  const timer = LLTimers.once(timeout, () => {
    if (resolved) return

    resolved = true

    LLEvents.off("dataserver", handler)

    coroutine.resume(co, false, "timeout")
  })

  return coroutine.yield() as unknown as YieldResult<string>
}
