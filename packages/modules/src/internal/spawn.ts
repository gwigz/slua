/**
 * @internal Run `fn` in a new coroutine. The coroutine starts immediately.
 *
 * Shared by `config` and `yield` modules so the create + resume
 * boilerplate isn't duplicated in the Lua output.
 */
export function spawn(fn: (this: void) => void) {
  const co = coroutine.create(fn as (this: void, ...args: any[]) => any[])

  coroutine.resume(co)

  return co
}
