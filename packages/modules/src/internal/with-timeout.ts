/**
 * @internal Result type for yieldable functions with timeout support.
 *
 * On success: `[true, T]` where T is the function's return value.
 * On timeout: `[false, "timeout"]`.
 */
export type YieldResult<T> = LuaMultiReturn<[true, T] | [false, string]>
