import * as ts from "typescript"
import { resolve, dirname } from "node:path"
import { createTsconfigResolverPlugin } from "./shake-plugin.js"

export { stripDeadExports } from "./shake-strip.js"

export interface ShakeOptions {
  /** Entry file paths (same files you'd pass as luaBundleEntry). */
  entry: string[]
  /** Path to tsconfig.json (used to resolve module paths). */
  tsconfig: string
}

export interface ShakeResult {
  /** All files to pass to TSTL (entry files + module files). */
  files: string[]
  /** Map of module file path to Set of surviving export names. */
  survivingExports: Map<string, Set<string>>
}

function readTsconfigPaths(tsconfigPath: string) {
  const absolute = resolve(tsconfigPath)
  const configFile = ts.readConfigFile(absolute, ts.sys.readFile)

  if (configFile.error) {
    const msg = ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n")
    throw new Error(`shakeModules: failed to read tsconfig at ${absolute}: ${msg}`)
  }

  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, dirname(absolute))

  if (parsed.errors.length > 0) {
    const msg = parsed.errors
      .map((e) => ts.flattenDiagnosticMessageText(e.messageText, "\n"))
      .join("\n")
    throw new Error(`shakeModules: tsconfig errors in ${absolute}: ${msg}`)
  }

  return {
    paths: parsed.options.paths ?? {},
    baseUrl: parsed.options.baseUrl ?? dirname(absolute),
  }
}

export async function shakeModules(options: ShakeOptions): Promise<ShakeResult> {
  let rollup: typeof import("rollup")

  try {
    rollup = await import("rollup")
  } catch {
    throw new Error(
      "shakeModules requires rollup as a peer dependency. Install it with: bun add -d rollup",
    )
  }

  const { paths, baseUrl } = readTsconfigPaths(options.tsconfig)
  const resolverPlugin = createTsconfigResolverPlugin({ paths, baseUrl })

  const resolvedModuleFiles = new Set<string>()
  const entryFiles = options.entry.map((e) => resolve(e))

  const wrappedPlugin: import("rollup").Plugin = {
    name: "tsconfig-resolver-wrapper",

    resolveId(source, importer) {
      const result = (resolverPlugin.resolveId as Function).call(this, source, importer)
      if (typeof result === "string") {
        resolvedModuleFiles.add(result)
        return result
      }
      if (!importer) return null
      return { id: source, external: true }
    },

    load(id) {
      return (resolverPlugin.load as Function).call(this, id)
    },
  }

  const bundle = await rollup.rollup({
    input: entryFiles,
    plugins: [wrappedPlugin],
    treeshake: true,
  })

  const { output } = await bundle.generate({
    format: "esm",
    preserveModules: true,
  })

  await bundle.close()

  const survivingExports = new Map<string, Set<string>>()

  for (const chunk of output) {
    if (chunk.type !== "chunk" || !chunk.facadeModuleId) continue

    if (resolvedModuleFiles.has(chunk.facadeModuleId)) {
      survivingExports.set(chunk.facadeModuleId, new Set(chunk.exports))
    }
  }

  const fileSet = new Set(entryFiles)
  for (const moduleFile of resolvedModuleFiles) {
    fileSet.add(moduleFile)
  }

  return { files: [...fileSet], survivingExports }
}
