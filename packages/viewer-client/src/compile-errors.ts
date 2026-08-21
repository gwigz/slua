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
  const diagnostics = response?.diagnostics ?? parseCompileErrors(response?.errors, language)

  return diagnostics.map(readable)
}

/** Control characters, which a terminal renders as anything from nothing to a mess. */
// oxlint-disable-next-line no-control-regex -- stripping them is the point
const UNPRINTABLE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g

/**
 * A diagnostic fit to print.
 *
 * A viewer has been seen answering a failed compile with a message of nothing
 * but NUL bytes, which is uninitialised memory rather than an error, and
 * printing it puts 58 invisible characters through the terminal, the JSON
 * output and the log file alike. The row it came with is still worth having,
 * so the message is replaced rather than the diagnostic dropped.
 */
function readable(diagnostic: Diagnostic): Diagnostic {
  const message = diagnostic.message.replaceAll(UNPRINTABLE, "").trim()

  if (message === diagnostic.message) return diagnostic

  return {
    ...diagnostic,
    message:
      message === "" ? "the viewer reported an error here but sent no message with it" : message,
  }
}
