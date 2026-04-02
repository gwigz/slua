import * as ts from "typescript"
import { dirname, join } from "node:path"
import type { Plugin } from "rollup"

interface ResolverOptions {
  paths: Record<string, string[]>
  baseUrl: string
}

const STRIP_TYPES_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  verbatimModuleSyntax: false,
}

/**
 * Rollup plugin that resolves tsconfig `paths` to .ts source files
 * and strips types so rollup can parse them for tree-shaking analysis.
 */
export function createTsconfigResolverPlugin(options: ResolverOptions): Plugin {
  const { paths, baseUrl } = options

  const matchers = Object.entries(paths)
    .filter(([pattern]) => pattern.includes("*"))
    .map(([pattern, substitutions]) => {
      const starIndex = pattern.indexOf("*")
      return {
        prefix: pattern.substring(0, starIndex),
        suffix: pattern.substring(starIndex + 1),
        substitutions,
      }
    })

  return {
    name: "tsconfig-resolver",

    resolveId(source, importer) {
      for (const { prefix, suffix, substitutions } of matchers) {
        if (source.startsWith(prefix) && source.endsWith(suffix)) {
          const wildcard = source.slice(prefix.length, source.length - suffix.length || undefined)

          for (const sub of substitutions) {
            const resolved = sub.replace("*", wildcard)
            const full = join(baseUrl, resolved)

            if (ts.sys.fileExists(full)) {
              return full
            }
          }
        }
      }

      if (
        importer &&
        importer.endsWith(".ts") &&
        (source.startsWith("./") || source.startsWith("../"))
      ) {
        const dir = dirname(importer)

        const withExt = join(dir, `${source}.ts`)
        if (ts.sys.fileExists(withExt)) return withExt

        const asIndex = join(dir, source, "index.ts")
        if (ts.sys.fileExists(asIndex)) return asIndex
      }

      return null
    },

    load(id) {
      if (!id.endsWith(".ts")) return null

      const source = ts.sys.readFile(id)
      if (source === undefined) return null

      const result = ts.transpileModule(source, {
        compilerOptions: STRIP_TYPES_OPTIONS,
      })

      return result.outputText
    },
  }
}
