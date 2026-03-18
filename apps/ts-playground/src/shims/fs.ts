// Stub fs so TypeScript can create ts.sys (needs fileExists, readFileSync, etc.).
// These are never actually called -- transpileVirtualProject uses virtual files.
const noop = () => {}
const fail = () => {
  throw new Error("fs not available in browser")
}

export const readFileSync = fail
export const writeFileSync = fail
export const mkdirSync = fail
export const readdirSync = () => []
export const statSync = fail
export const closeSync = noop
export const openSync = fail
export const writeSync = fail
export const unlinkSync = fail
export const utimesSync = noop
export const watch = noop
export const watchFile = noop
export const unwatchFile = noop
export const realpathSync = Object.assign(fail, { native: undefined })
export const existsSync = () => false
export const lstatSync = fail
export const chmodSync = noop
export const renameSync = fail
export const copyFileSync = fail
export const accessSync = fail
export const createReadStream = fail
export const createWriteStream = fail
export const constants = { F_OK: 0, R_OK: 4, W_OK: 2, X_OK: 1 }

export default {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
  closeSync,
  openSync,
  writeSync,
  unlinkSync,
  utimesSync,
  watch,
  watchFile,
  unwatchFile,
  realpathSync,
  existsSync,
  lstatSync,
  chmodSync,
  renameSync,
  copyFileSync,
  accessSync,
  createReadStream,
  createWriteStream,
  constants,
}
