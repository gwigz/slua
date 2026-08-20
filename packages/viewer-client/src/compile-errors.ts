import type { CompilationError } from "./protocol/types.js"

/**
 * `object.content.save` hands back raw compiler output as a `string[]`.
 *
 * The viewer only parses those strings into `{row, column, ...}` on the
 * `script.compiled` notification path, which is routed exclusively to
 * `script.subscribe` subscribers — so on the save path it is our job. These
 * mirror the regexes in `llscripteditorws.cpp` (`sendCompileResults`), which
 * are full matches, hence the anchors.
 */
const LUAU_ERROR = /^[^:]*:(\d+): (.+)$/
const LSL_ERROR = /^\((\d+), (\d+)\) : ([^:]+) : (.+)$/

export type CompileLanguage = "luau" | "lsl"

/** Parses one raw compiler line, falling back to row 0 when it doesn't match. */
export function parseCompileError(raw: string, language: CompileLanguage): CompilationError {
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
): CompilationError[] {
  return (errors ?? []).map((raw) => parseCompileError(raw, language))
}
