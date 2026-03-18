// Minimal os shim -- TypeScript's sys creation may reference os.platform().
export const EOL = "\n"
export function platform() {
  return "linux"
}
export function tmpdir() {
  return "/tmp"
}
export function homedir() {
  return "/"
}
export function cpus() {
  return []
}
export function arch() {
  return "x64"
}
export default { EOL, platform, tmpdir, homedir, cpus, arch }
