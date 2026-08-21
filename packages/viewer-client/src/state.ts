import { appendFile, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { join } from "node:path"

/** Where a session's state lives, beside the `slua.json` it belongs to. */
export const STATE_DIRECTORY = ".slua"

export const SESSION_FILE = "session.json"
export const LOG_FILE = "logs.jsonl"

/** Rotated at this size, keeping one previous file. */
export const LOG_MAX_BYTES = 5 * 1024 * 1024

/**
 * What a running `connect` says about itself.
 *
 * Never trusted on its own. A pid file outlives the process that wrote it, so
 * liveness is decided by connecting to the socket, not by reading this.
 */
export interface SessionInfo {
  pid: number
  /** Control socket path. Absent until the socket is listening. */
  socket?: string
  /** The viewer port the session is connected to. */
  port: number
  /** The project root, which is the directory holding `slua.json`. */
  root: string
  version: string
  startedAt: string
}

export interface SessionState {
  readonly directory: string
  readonly logPath: string
  /** Writes the session file, once the socket it names is this session's. */
  announce(): Promise<void>
  /** Appends one record. Ordering is preserved; failures are reported once. */
  append(record: Record<string, unknown>): void
  flush(): Promise<void>
  /** Forgets the session, then flushes, so a stale file never outlives it. */
  close(): Promise<void>
}

export function stateDirectory(root: string): string {
  return join(root, STATE_DIRECTORY)
}

/** The version of the CLI writing the state, so a mismatch can be reported. */
export function cliVersion(): string {
  return createRequire(import.meta.url)("../package.json").version
}

/** Reads a project's session file, or nothing when no session wrote one. */
export async function readSession(root: string): Promise<SessionInfo | undefined> {
  try {
    return JSON.parse(await readFile(join(stateDirectory(root), SESSION_FILE), "utf8"))
  } catch {
    // Missing, or half-written by a session that died. Nothing to trust.
    return undefined
  }
}

export interface StateOptions {
  /** Told once when the sink cannot write, rather than on every record. */
  onError?: (error: Error) => void
  /** Overrides the rotation size. Mostly here so a test can reach it. */
  maxBytes?: number
}

/**
 * Opens `.slua/` for a session, with a log sink and a session file to write.
 *
 * The sink is what an agent reads with no integration at all. `tail -n 100
 * .slua/logs.jsonl` needs nothing from us, and it survives `connect` crashing,
 * which is when its output is worth reading.
 */
export async function openState(
  root: string,
  info: Omit<SessionInfo, "pid" | "version" | "startedAt"> & Partial<SessionInfo>,
  options: StateOptions = {},
): Promise<SessionState> {
  const directory = stateDirectory(root)
  const logPath = join(directory, LOG_FILE)
  const sessionPath = join(directory, SESSION_FILE)

  await mkdir(directory, { recursive: true })

  const session: SessionInfo = {
    pid: process.pid,
    version: cliVersion(),
    startedAt: new Date().toISOString(),
    ...info,
  }

  const document = `${JSON.stringify(session, null, 2)}\n`

  /**
   * Written aside and renamed over. A reader that opens this file mid-write
   * would otherwise parse half a document and conclude there is no session.
   */
  const announce = async () => {
    const pending = `${sessionPath}.${process.pid}.tmp`

    await writeFile(pending, document, "utf8")
    await rename(pending, sessionPath)
  }

  /** Whether the file on disk is still the one this session wrote, byte for byte. */
  const owned = async () =>
    (await readFile(sessionPath, "utf8").catch(() => undefined)) === document

  let size = await stat(logPath)
    .then((stats) => stats.size)
    .catch(() => 0)

  const maxBytes = options.maxBytes ?? LOG_MAX_BYTES

  let chain: Promise<void> = Promise.resolve()
  let reported = false

  const write = async (line: string) => {
    // Bytes, not characters. `stat` counts what is on disk, and one emoji in
    // a log line is four of them, so a character count drifts under the cap.
    const bytes = Buffer.byteLength(line, "utf8")

    // Rotated before the write rather than after, so the cap is a ceiling
    // rather than a line it is allowed to cross once.
    if (size > 0 && size + bytes > maxBytes) {
      await rename(logPath, `${logPath}.1`)

      size = 0
    }

    await appendFile(logPath, line, "utf8")

    size += bytes
  }

  return {
    directory,
    logPath,
    announce,

    append(record) {
      const line = `${JSON.stringify(record)}\n`

      // Chained rather than awaited by the caller. A log sink must not slow
      // down, or reorder, the stream it is recording.
      chain = chain.then(
        () => write(line),
        () => write(line),
      )

      chain = chain.catch((error: unknown) => {
        if (reported) return

        reported = true

        options.onError?.(error instanceof Error ? error : new Error(String(error)))
      })
    },

    flush() {
      return chain
    },

    async close() {
      // Teardown releases the control socket first, so a replacement session
      // may already have written its own file. Deleting that one would hide a
      // session that is running.
      if (await owned()) await rm(sessionPath, { force: true })

      await chain
    },
  }
}
