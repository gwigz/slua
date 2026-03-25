import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import { getPlugins } from "typescript-to-lua/dist/transpilation/plugins"
import { getProgramTranspileResult } from "typescript-to-lua/dist/transpilation/transpile"
import createPlugin from "../index"

const plugin = createPlugin()
const optimizedPlugin = createPlugin({ optimize: true })

const tsLibDir = ts.getDefaultLibFilePath({}).replace(/[/\\][^/\\]+$/, "")

// Cache stable source files so TypeScript can skip re-parsing them
const sourceFileCache = new Map<string, ts.SourceFile>()

function getCachedSourceFile(fileName: string, content: string): ts.SourceFile {
  let sf = sourceFileCache.get(fileName)

  if (!sf) {
    sf = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, false)
    sourceFileCache.set(fileName, sf)
  }

  return sf
}

function createHost(files: Record<string, string>): ts.CompilerHost {
  return {
    fileExists: (fileName) => fileName in files || ts.sys.fileExists(fileName),
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => "",
    getDefaultLibFileName: ts.getDefaultLibFileName,
    readFile: () => "",
    getNewLine: () => "\n",
    useCaseSensitiveFileNames: () => false,
    writeFile() {},
    getSourceFile(fileName) {
      if (fileName in files) {
        if (fileName === "main.ts") {
          return ts.createSourceFile(fileName, files[fileName], ts.ScriptTarget.Latest, false)
        }

        return getCachedSourceFile(fileName, files[fileName])
      }

      if (fileName.startsWith("lib.")) {
        const cached = sourceFileCache.get(fileName)

        if (cached) {
          return cached
        }

        const content = ts.sys.readFile(tsLibDir + "/" + fileName)

        if (content === undefined) {
          return undefined
        }

        const sf = ts.createSourceFile(
          tsLibDir + "/" + fileName,
          content,
          ts.ScriptTarget.Latest,
          false,
        )

        sourceFileCache.set(fileName, sf)

        return sf
      }

      if (fileName.includes("language-extensions")) {
        const cached = sourceFileCache.get(fileName)

        if (cached) {
          return cached
        }

        const dtsName = fileName.replace(/(\.d)?(\.ts)$/, ".d.ts")
        const content = ts.sys.readFile(ts.sys.resolvePath(dtsName))

        if (content === undefined) {
          return undefined
        }

        return getCachedSourceFile(fileName, content)
      }
    },
  }
}

const noopWrite: ts.WriteFileCallback = () => {}

function transpileWith(
  files: Record<string, string>,
  options: tstl.CompilerOptions,
  oldProgram: ts.Program | undefined,
): { code: string; program: ts.Program } {
  const host = createHost(files)
  const program = ts.createProgram(Object.keys(files), options, host, oldProgram)
  const mainFile = program.getSourceFile("main.ts")!
  const { plugins } = getPlugins(program)

  const result = getProgramTranspileResult(ts.sys, noopWrite, {
    program,
    plugins,
    sourceFiles: [mainFile],
  })

  return { code: result.transpiledFiles[0]?.code ?? "", program }
}

const baseOptions: tstl.CompilerOptions = {
  luaTarget: tstl.LuaTarget.Luau,
  noImplicitSelf: true,
  noHeader: true,
  luaPlugins: [{ plugin: plugin as tstl.Plugin }],
}

// Simple transpile, no type files, used by most tests
let simpleOldProgram: ts.Program | undefined

const simpleOptions: tstl.CompilerOptions = {
  ...baseOptions,
  luaLibImport: tstl.LuaLibImportKind.None,
}

export function transpile(code: string) {
  const result = transpileWith({ "main.ts": code }, simpleOptions, simpleOldProgram)

  simpleOldProgram = result.program

  return result.code
}

// Optimized transpile (optimize: true), no type files
let simpleOptimizedOldProgram: ts.Program | undefined

const simpleOptimizedOptions: tstl.CompilerOptions = {
  ...simpleOptions,
  luaPlugins: [{ plugin: optimizedPlugin as tstl.Plugin }],
}

export function transpileOptimized(code: string) {
  const result = transpileWith(
    { "main.ts": code },
    simpleOptimizedOptions,
    simpleOptimizedOldProgram,
  )

  simpleOptimizedOldProgram = result.program

  return result.code
}

// Full transpile, includes SLua types + language extensions
let fullOldProgram: ts.Program | undefined

const fullOptions: tstl.CompilerOptions = {
  ...baseOptions,
  luaLibImport: tstl.LuaLibImportKind.Inline,
  noImplicitGlobalVariables: true,
  noLib: true,
  strict: true,
}

let fullFiles: Record<string, string> | undefined

export function initFull(sluaTypes: string, langExt: string) {
  fullFiles = { "language-extensions.d.ts": langExt, "slua.d.ts": sluaTypes }
}

export function transpileFull(code: string) {
  if (!fullFiles) {
    throw new Error("Call initFull() before transpileFull()")
  }

  const result = transpileWith({ "main.ts": code, ...fullFiles }, fullOptions, fullOldProgram)

  fullOldProgram = result.program

  return result.code
}

// Define-aware transpile, creates a fresh plugin per call with the given define map.
// Cannot reuse old programs since each has a different plugin instance.
export function transpileWithDefine(
  code: string,
  define: Record<string, boolean | number | string>,
) {
  const definePlugin = createPlugin({ define })

  const defineOptions: tstl.CompilerOptions = {
    ...simpleOptions,
    luaPlugins: [{ plugin: definePlugin as tstl.Plugin }],
  }

  const result = transpileWith({ "main.ts": code }, defineOptions, undefined)

  return result.code
}
