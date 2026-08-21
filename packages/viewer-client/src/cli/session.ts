import pc from "picocolors"
import type { ViewerClient } from "../client.js"
import type { Reporter } from "./output.js"

const RECONNECT_BASE_MS = 1_000
const RECONNECT_MAX_MS = 30_000

export interface SessionOptions {
  /** Opens a connection. Called again for each reconnect. */
  connect: () => Promise<ViewerClient>
  /**
   * Subscribes and resolves whatever this session needs from the viewer.
   *
   * Runs on every connection, not just the first, since a viewer that
   * restarted has forgotten what was published to the old one.
   */
  onConnected?: (client: ViewerClient) => Promise<void>
  /** Reconnect with backoff rather than returning when the connection drops. */
  follow: boolean
  reporter: Reporter
  /** Runs once on the way out, interrupted or not, before the process ends. */
  onStop?: () => Promise<void> | void
}

/**
 * Resolves when the connection drops, or when `interrupted` is called.
 *
 * Closing the connection ourselves does not reach `onClose`. `close()` marks
 * it disposed before the transport reports back, and that check is what stops
 * listeners firing twice, so an interrupt has to end this wait directly.
 */
function untilClosed(client: ViewerClient, interrupted: (end: () => void) => void): Promise<void> {
  return new Promise<void>((done) => {
    interrupted(done)

    client.connection.onClose(() => done())
    client.connection.peer.on("session.disconnect", () => done())
  })
}

/**
 * Holds a viewer connection, reconnecting with backoff while it is asked to.
 *
 * Shared by `logs -f`, keeping a stream alive, and `connect`, keeping a
 * session alive.
 *
 * Interrupting returns rather than calling `process.exit`, so a caller with
 * buffered writes gets to flush them. Half a line in a log file is worse than
 * none, and a crash is when that file matters most.
 */
export async function runSession({
  connect,
  onConnected,
  follow,
  reporter,
  onStop,
}: SessionOptions): Promise<void> {
  let attempt = 0
  let stopping = false
  let current: ViewerClient | undefined
  let wake: (() => void) | undefined

  const interrupt = () => {
    // A second ctrl-c means the first one did not get us out fast enough.
    if (stopping) process.exit(130)

    stopping = true
    current?.close()
    wake?.()
  }

  process.on("SIGINT", interrupt)

  try {
    // oxlint-disable-next-line no-unmodified-loop-condition -- set by the SIGINT handler above
    while (!stopping) {
      try {
        const client = await connect()

        current = client

        try {
          await onConnected?.(client)
        } catch (error) {
          // The socket is open from here on, and an open socket keeps the
          // event loop alive, so a failed setup would hang rather than report.
          client.close()

          throw error
        }

        // An interrupt during setup has already closed the client, and
        // `untilClosed` would then wait for a close that has been and gone.
        if (stopping) {
          client.close()

          break
        }

        attempt = 0

        await untilClosed(client, (end) => {
          wake = end
        })

        wake = undefined

        // A `session.disconnect` can arrive with the socket still open, so the
        // old client goes before a replacement takes its place.
        client.close()
      } catch (error) {
        if (!follow) throw error
        if (stopping) break

        reporter.note(pc.dim(`disconnected: ${error instanceof Error ? error.message : error}`))
      }

      if (!follow || stopping) break

      // Back off so a viewer that is closed or restarting isn't hammered.
      const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt++, RECONNECT_MAX_MS)

      reporter.note(pc.dim(`reconnecting in ${Math.round(delay / 1000)}s`))

      await new Promise<void>((done) => {
        const timer = setTimeout(done, delay)

        // Interrupting during the backoff should not wait it out.
        wake = () => {
          clearTimeout(timer)
          done()
        }
      })

      wake = undefined
    }
  } finally {
    // Removed on the way out, or a caller that runs this more than once would
    // stack a handler per call.
    process.off("SIGINT", interrupt)

    current?.close()

    await onStop?.()
  }
}
