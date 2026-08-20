import { relative } from "node:path"
import pc from "picocolors"

/**
 * Output split for the two modes.
 *
 * Under `--json`, stdout carries exactly one JSON document and nothing else,
 * so the CLI can be piped into `jq` or read by an agent; every human-facing
 * message goes to stderr instead.
 */
export interface Reporter {
  readonly json: boolean
  /** The command's structured result. Printed only in JSON mode. */
  data(payload: unknown): void
  /** Human-facing output. Suppressed in JSON mode. */
  line(text?: string): void
  /** Progress and warnings. Always stderr, so it never pollutes piped output. */
  note(text: string): void
  error(text: string): void
}

export function createReporter(json: boolean): Reporter {
  return {
    json,
    data(payload) {
      if (json) process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`)
    },
    line(text = "") {
      if (!json) process.stdout.write(`${text}\n`)
    },
    note(text) {
      process.stderr.write(`${text}\n`)
    },
    error(text) {
      process.stderr.write(`${pc.red("error:")} ${text}\n`)
    },
  }
}

/** Whichever of the relative or absolute path is easier to read. */
export function displayPath(path: string): string {
  const relativePath = relative(process.cwd(), path)

  return relativePath.startsWith("..") && relativePath.length >= path.length ? path : relativePath
}
