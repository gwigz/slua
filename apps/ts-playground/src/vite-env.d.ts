/// <reference types="vite/client" />

declare module "path-browserify" {
  import path from "path"
  export = path
}

declare module "virtual:tstl-lualib" {
  const files: Record<string, string>
  export default files
}
