/**
 * Says a diagnostic in owner chat.
 *
 * Guard every call with `if (TRACING)`. A logger that returned early would
 * still receive its message, so the caller would build it first. Guarded, a
 * release build drops the call and its message, and tree shaking then drops
 * this function too.
 */
export function trace(message: string) {
  ll.OwnerSay(message)
}
