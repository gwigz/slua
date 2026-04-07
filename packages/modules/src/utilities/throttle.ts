/**
 * Rate-limits calls to at most once per `seconds`. The first call fires
 * immediately (leading edge). If more calls arrive during the window, the
 * last one fires when the timer expires (trailing edge).
 *
 * @returns `[wrapped, cancel]`. Call `cancel()` to clear the timer and
 * discard any saved trailing args.
 *
 * @example
 * ```ts
 * import { throttle } from "@gwigz/slua-modules/utilities"
 *
 * const [say, cancelSay] = throttle((msg: string) => {
 *   ll.Say(0, msg)
 * }, 1)
 *
 * LLEvents.on("touch_start", () => {
 *   say("touched!")
 * })
 * ```
 */
export function throttle<A extends any[]>(
  fn: (this: void, ...args: A) => void,
  seconds: number,
): LuaMultiReturn<[wrapped: (this: void, ...args: A) => void, cancel: () => void]> {
  let timer: LLTimerCallback | undefined
  let trailing: A | undefined

  function onExpiry() {
    if (trailing) {
      const args = trailing
      trailing = undefined

      fn(...args)
      timer = LLTimers.once(seconds, onExpiry)
    } else {
      timer = undefined
    }
  }

  function wrapped(this: void, ...args: A) {
    if (timer) {
      trailing = args
      return
    }

    fn(...args)
    timer = LLTimers.once(seconds, onExpiry)
  }

  function cancel() {
    if (timer) {
      LLTimers.off(timer)
      timer = undefined
    }

    trailing = undefined
  }

  return $multi(wrapped, cancel)
}
