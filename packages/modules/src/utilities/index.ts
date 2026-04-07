/**
 * @module utilities
 *
 * Rate-limiting primitives built on top of SLua's `LLTimers` API.
 *
 * Each function accepts a callback and a duration in seconds, and returns
 * a `[wrapped, cancel]` tuple via `$multi`.
 *
 * - {@link debounce} delay until activity stops
 * - {@link throttle} at most once per interval (leading + trailing)
 * - {@link cooldown} fire once, then drop calls for the duration
 *
 * @example
 * ```ts
 * import { debounce, throttle, cooldown } from "@gwigz/slua-modules/utilities"
 * ```
 *
 * @version 0.1.0
 */

export { debounce } from "./debounce"
export { throttle } from "./throttle"
export { cooldown } from "./cooldown"
