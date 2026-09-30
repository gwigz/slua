/**
 * Set by the SLua plugin's `define` option: false in `tsconfig.json`, true in
 * `tsconfig.debug.json`. The plugin writes the value in, so `if (TRACING)`
 * compiles to nothing in a release build.
 */
declare const TRACING: boolean
