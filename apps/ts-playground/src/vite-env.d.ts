/// <reference types="vite/client" />

declare module "path-browserify" {
  import path from "path"
  export = path
}

declare module "virtual:tstl-lualib" {
  const files: Record<string, string>
  export default files
}

declare module "monaco-editor/esm/vs/editor/editor.worker" {
  export function initialize(foreignModule: unknown): void
}

declare module "monaco-editor/esm/vs/language/typescript/ts.worker" {
  export function initialize(factory: (ctx: object, createData: object) => object): void
  export function create(ctx: object, createData: object): object
}

