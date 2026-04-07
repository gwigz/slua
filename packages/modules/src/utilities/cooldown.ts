/**
 * Pure gate. Fires `fn` immediately on the first call, then drops all
 * subsequent calls for `seconds`. After the window expires the gate resets.
 *
 * @returns `[wrapped, cancel]`. Call `cancel()` to reset the gate early.
 *
 * @example
 * ```ts
 * import { cooldown } from "@gwigz/slua-modules/utilities"
 *
 * const [activate, cancelCooldown] = cooldown((id: UUID) => {
 *   ll.Say(0, `activated by ${id}`)
 * }, 5)
 *
 * LLEvents.on("touch_start", (detected) => {
 *   activate(detected[0].getKey())
 * })
 * ```
 */
export function cooldown<A extends any[]>(
  fn: (this: void, ...args: A) => void,
  seconds: number,
): LuaMultiReturn<[wrapped: (this: void, ...args: A) => void, cancel: () => void]> {
  let timer: LLTimerCallback | undefined

  function wrapped(this: void, ...args: A) {
    if (timer) {
      return
    }

    fn(...args)
    timer = LLTimers.once(seconds, () => {
      timer = undefined
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
