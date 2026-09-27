import * as path from "node:path"
import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import {
  getLuaLibModulesInfo,
  resolveRecursiveLualibFeatures,
} from "typescript-to-lua/dist/LuaLib.js"

import type { EmitFile, EmitHost, LuaLibFeature, ProcessedFile } from "typescript-to-lua"
import type { LuaLibModulesInfo } from "typescript-to-lua/dist/LuaLib.js"
import type { OptimizeFlags } from "./optimize.js"

export const LUALIB_REPORT_CODE = 90002

interface LualibHint {
  text: string
  /** Skip the hint when this optimize flag is already on. */
  unlessFlag?: keyof OptimizeFlags
}

const FOR_IN_HINT: LualibHint = { text: "`for...in` compiles to `pairs` with no helper" }

/** Native alternatives for common helpers, keyed by lualib feature. */
const LUALIB_HINTS: Partial<Record<LuaLibFeature, LualibHint>> = {
  [tstl.LuaLibFeature.ArrayConcat]: {
    text: "`arr = arr.concat(b)` as a statement extends `arr` in place with `table.extend`",
  },
  [tstl.LuaLibFeature.ArrayFilter]: {
    text: "the `filter` optimize flag inlines `.filter()` as a loop when a file has one call",
    unlessFlag: "filter",
  },
  [tstl.LuaLibFeature.ArrayForEach]: {
    text: "a `for...of` loop compiles to `ipairs` with no helper",
  },
  [tstl.LuaLibFeature.ArrayIncludes]: {
    text: "`arr.includes(x)` without `fromIndex` compiles to `table.find`",
  },
  [tstl.LuaLibFeature.ArrayIndexOf]: {
    text: "`arr.indexOf(x)` without `fromIndex` compiles to `table.find`",
  },
  [tstl.LuaLibFeature.ArrayPush]: {
    text: "`push` as a statement compiles to `table.append` or `table.extend`, unless it mixes values and spreads",
  },
  [tstl.LuaLibFeature.ArraySetLength]: {
    text: "the `tableClear` optimize flag compiles `arr.length = 0` to `table.clear(arr)`",
    unlessFlag: "tableClear",
  },
  [tstl.LuaLibFeature.ArraySplice]: { text: "rebuild the array in a loop instead" },
  [tstl.LuaLibFeature.Delete]: {
    text: "assign `undefined` instead, which compiles to `t[k] = nil`",
  },
  [tstl.LuaLibFeature.Map]: { text: "a plain `Record<K, V>` table avoids the polyfill" },
  [tstl.LuaLibFeature.ObjectEntries]: FOR_IN_HINT,
  [tstl.LuaLibFeature.ObjectKeys]: FOR_IN_HINT,
  [tstl.LuaLibFeature.ObjectValues]: FOR_IN_HINT,
  [tstl.LuaLibFeature.Set]: { text: "a `Record<K, true>` table avoids the polyfill" },
  [tstl.LuaLibFeature.StringEndsWith]: {
    text: "`str.endsWith(x)` without `endPosition` compiles natively",
  },
  [tstl.LuaLibFeature.StringIncludes]: {
    text: "`str.includes(x)` without `position` compiles to `string.find`",
  },
  [tstl.LuaLibFeature.StringSplit]: {
    text: "`str.split(sep)` with a separator compiles to `string.split`",
  },
  [tstl.LuaLibFeature.StringStartsWith]: {
    text: "`str.startsWith(x)` without `position` compiles natively",
  },
}

/**
 * Records the lualib features each source file's Lua output uses, keyed by
 * source file name, so `reportLualibHelpers` can map them to output files.
 */
export function recordLualibFeatures(
  files: readonly ProcessedFile[],
  into: Map<string, ReadonlySet<LuaLibFeature>>,
) {
  for (const file of files) {
    const features = file.luaAst?.luaLibFeatures
    if (!features || features.size === 0) continue

    for (const sourceFile of file.sourceFiles ?? []) {
      into.set(sourceFile.fileName, new Set(features))
    }
  }
}

/** Prefer the `__TS__` export, since that's the name found in the output. */
function helperName(feature: LuaLibFeature, info: LuaLibModulesInfo): string {
  const prefixed = `__TS__${feature}`
  const exports = info[feature]?.exports ?? []

  return exports.includes(prefixed) ? prefixed : (exports[0] ?? prefixed)
}

/**
 * Builds one warning per output file that uses lualib helpers. Each helper
 * the source uses directly gets its own line, with the source files that use
 * it when the output bundles several, and a native alternative when one is
 * known. Helpers pulled in only as dependencies share a final line.
 */
export function reportLualibHelpers(
  files: readonly EmitFile[],
  featuresBySource: ReadonlyMap<string, ReadonlySet<LuaLibFeature>>,
  options: tstl.CompilerOptions,
  emitHost: EmitHost,
  opt: OptimizeFlags,
): ts.Diagnostic[] {
  const diagnostics: ts.Diagnostic[] = []
  const cwd = emitHost.getCurrentDirectory()
  const luaTarget = options.luaTarget ?? tstl.LuaTarget.Universal
  let info: LuaLibModulesInfo | undefined

  const displayPath = (fileName: string) =>
    (path.relative(cwd, fileName) || fileName).replace(/\\/g, "/")

  for (const file of files) {
    const sourceFiles = file.sourceFiles ?? []
    const users = new Map<LuaLibFeature, string[]>()

    for (const sourceFile of sourceFiles) {
      for (const feature of featuresBySource.get(sourceFile.fileName) ?? []) {
        const list = users.get(feature)
        if (list) list.push(sourceFile.fileName)
        else users.set(feature, [sourceFile.fileName])
      }
    }

    if (users.size === 0) continue

    const modulesInfo = (info ??= getLuaLibModulesInfo(luaTarget, emitHost))
    const all = resolveRecursiveLualibFeatures(users.keys(), luaTarget, emitHost, modulesInfo)
    const lines: string[] = []

    // Sort by feature, so `Map` and `__TS__ArrayPush` interleave by name
    const byFeature = [...users].toSorted(([a], [b]) => a.localeCompare(b))

    for (const [feature, fileNames] of byFeature) {
      let line = helperName(feature, modulesInfo)

      if (sourceFiles.length > 1) {
        line += ` (${fileNames.map(displayPath).join(", ")})`
      }

      const hint = LUALIB_HINTS[feature]

      if (hint && !(hint.unlessFlag && opt[hint.unlessFlag])) {
        line += `: ${hint.text}`
      }

      lines.push(line)
    }

    const dependencies = all
      .filter((feature) => !users.has(feature))
      .toSorted((a, b) => a.localeCompare(b))
      .map((feature) => helperName(feature, modulesInfo))

    if (dependencies.length > 0) {
      lines.push(`${dependencies.join(", ")}: pulled in by the helpers above`)
    }

    const count = `${all.length} lualib helper${all.length === 1 ? "" : "s"}`

    diagnostics.push({
      file: undefined,
      start: undefined,
      length: undefined,
      messageText: {
        messageText: `${displayPath(file.outputPath)} uses ${count}`,
        category: ts.DiagnosticCategory.Warning,
        code: LUALIB_REPORT_CODE,
        next: lines.map((messageText) => ({
          messageText,
          category: ts.DiagnosticCategory.Warning,
          code: LUALIB_REPORT_CODE,
          next: undefined,
        })),
      },
      category: ts.DiagnosticCategory.Warning,
      code: LUALIB_REPORT_CODE,
      source: "@gwigz/slua-tstl-plugin",
    })
  }

  return diagnostics
}
