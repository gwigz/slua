// path-browserify sets win32: null, but TypeScript accesses path.win32.normalize.
import path from "path-browserify"

const patched = { ...path, win32: path, posix: path }

export default patched
export const {
  resolve, normalize, isAbsolute, join, relative,
  dirname, basename, extname, sep, delimiter,
  parse, format,
} = patched
export const win32 = patched
export const posix = patched
