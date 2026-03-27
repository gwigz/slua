/**
 * @internal Shared dataserver yield pattern, registers a handler filtered
 * by request ID, yields, returns the data string.
 *
 * Used by both `config` and `yield` modules to avoid duplicating the
 * dataserver handler logic in the Lua output.
 */
export function yieldDataserver(requestId: UUID): string {
  const co = coroutine.running()!

  const handler = LLEvents.on("dataserver", (reqId: UUID, data: string) => {
    if (reqId !== requestId) {
      return
    }

    LLEvents.off("dataserver", handler)

    coroutine.resume(co, data)
  })

  return coroutine.yield() as unknown as string
}
