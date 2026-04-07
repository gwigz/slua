/**
 * Delays execution until activity stops. Each call resets the timer;
 * `fn` fires only after `seconds` of silence with the latest args.
 *
 * @returns `[wrapped, cancel]`. Call `cancel()` to clear any pending timer.
 *
 * @example
 * ```ts
 * import { debounce } from "@gwigz/slua-modules/utilities"
 *
 * const [save, cancelSave] = debounce((id: UUID) => {
 *   ll.Say(0, `saved ${id}`)
 * }, 2)
 *
 * LLEvents.on("touch_start", (detected) => {
 *   save(detected[0].getKey())
 * })
 * ```
 */
export function debounce<A extends any[]>(
  fn: (this: void, ...args: A) => void,
  seconds: number,
): LuaMultiReturn<[wrapped: (this: void, ...args: A) => void, cancel: () => void]> {
  let timer: LLTimerCallback | undefined

  function wrapped(this: void, ...args: A) {
    if (timer) {
      LLTimers.off(timer)
    }

    timer = LLTimers.once(seconds, () => {
      timer = undefined
      fn(...args)
    })
  }

  function cancel() {
    if (timer) {
      LLTimers.off(timer)
      timer = undefined
    }
  }

  return $multi(wrapped, cancel)
}
