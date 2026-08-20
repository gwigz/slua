import type { Diagnostic, ObjectContentSaveResponse } from "./protocol/types.js"

/**
 * Older viewers hand `object.content.save` failures back as raw compiler
 * output, a `string[]`, and parse them into `{row, column, ...}` only on the
 * `script.compiled` notification path, which is routed exclusively to
 * `script.subscribe` subscribers. A viewer advertising `unifiedDiagnostics`
 * parses the save path too and sends `diagnostics` instead, so this is the
 * fallback for the ones that do not. These mirror the regexes in
 * `llscripteditorws.cpp` (`sendCompileResults`), which are full matches,
 * hence the anchors.
 */
const LUAU_ERROR = /^[^:]*:(\d+): (.+)$/
const LSL_ERROR = /^\((\d+), (\d+)\) : ([^:]+) : (.+)$/

export type CompileLanguage = "luau" | "lsl"

/** Parses one raw compiler line, falling back to row 0 when it doesn't match. */
export function parseCompileError(raw: string, language: CompileLanguage): Diagnostic {
  if (language === "luau") {
    const match = LUAU_ERROR.exec(raw)

    // The Luau compiler reports 1-based lines and no column at all.
    return {
      row: match ? Number(match[1]) : 0,
      column: 0,
      level: "ERROR",
      message: match ? match[2] : raw,
    }
  }

  const match = LSL_ERROR.exec(raw)

  if (!match) {
    return { row: 0, column: 0, level: "ERROR", message: raw, format: "lsl" }
  }

  // LSL reports 0-based line and column, so both shift up by one.
  return {
    row: Number(match[1]) + 1,
    column: Number(match[2]) + 1,
    level: match[3],
    message: match[4],
    format: "lsl",
  }
}

export function parseCompileErrors(
  errors: readonly string[] | undefined,
  language: CompileLanguage,
): Diagnostic[] {
  return (errors ?? []).map((raw) => parseCompileError(raw, language))
}

/**
 * The diagnostics in a save response, whichever shape the viewer sent.
 *
 * Prefers the viewer's own parse, since it reads the compiler output the
 * compiler produced rather than guessing at its format from here.
 */
export function diagnosticsFrom(
  response: Pick<ObjectContentSaveResponse, "diagnostics" | "errors"> | undefined,
  language: CompileLanguage,
): Diagnostic[] {
  return response?.diagnostics ?? parseCompileErrors(response?.errors, language)
}
