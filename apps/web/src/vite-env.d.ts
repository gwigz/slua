/// <reference types="vite/client" />

declare module "path-browserify" {
  import path from "path"
  export = path
}

declare module "virtual:hero-preview" {
  export const tsHtml: string
  export const luaHtml: string
}

declare module "virtual:twoslash-blocks" {
  export const tsHtml: string
  export const luaHtml: string
}

declare module "virtual:quickstart-blocks" {
  export const install: Record<string, string>
  export const tsconfig: string
  export const compile: Record<string, string>
  export const vscodeSettings: string
  export const gitattributes: string
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
