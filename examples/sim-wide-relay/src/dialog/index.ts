/**
 * Sim-Wide Chat Relay — dialog prompt handler
 *
 * Isolates ll.TextBox calls (which have a 1-second sleep) from the sender
 * script so that relay message routing is never stalled.
 *
 * Receives requests via link message, prompts the avatar, and sends the
 * completed command back to the sender via link message.
 *
 * @link https://github.com/gwigz/slua/tree/main/examples/sim-wide-relay
 */

import { NOTECARD_NAME, config } from "./constants"
import { loadConfig, onConfigChanged } from "@gwigz/slua-modules/config"

interface PendingAction {
  action: string
  timestamp: number
}

const pending: Record<string, PendingAction> = {}
const lastRequest: Record<string, number> = {}

let dialogListenHandle: number | undefined

function startListening() {
  if (dialogListenHandle !== undefined) {
    ll.ListenRemove(dialogListenHandle)
  }

  dialogListenHandle = ll.Listen(config.DIALOG_CHANNEL, "", NULL_KEY, "")
}

function cleanupStale() {
  const now = ll.GetUnixTime()

  for (const [key, entry] of Object.entries(pending)) {
    if (now - entry.timestamp > config.PENDING_TIMEOUT) {
      pending[key] = undefined!
    }
  }
}

// Receive TextBox requests from sender via link message
LLEvents.on("link_message", (_link, _num, action, avatarKey) => {
  if (action !== "block" && action !== "unblock") {
    return
  }

  const now = ll.GetUnixTime()

  // Rate limit per avatar
  const last = lastRequest[avatarKey]

  if (last !== undefined && now - last < config.RATE_LIMIT) {
    return
  }

  lastRequest[avatarKey] = now

  // Replace any existing pending action for this avatar
  pending[avatarKey] = { action, timestamp: now }

  const prompt =
    action === "block"
      ? "Enter the UUID of the avatar to block:"
      : "Enter the UUID of the avatar to unblock:"

  ll.TextBox(new UUID(avatarKey), prompt, config.DIALOG_CHANNEL)
})

// Receive TextBox responses from avatar
LLEvents.on("listen", (channel, _name, id, text) => {
  if (channel !== config.DIALOG_CHANNEL) {
    return
  }

  const avatarKey = tostring(id)
  const entry = pending[avatarKey]

  if (entry === undefined) {
    return
  }

  pending[avatarKey] = undefined!

  // Send completed command back to sender via link message
  ll.MessageLinked(LINK_THIS, 0, `${entry.action} ${text.trim()}`, avatarKey)
})

// Periodic cleanup of stale pending actions
LLTimers.every(config.PENDING_TIMEOUT, cleanupStale)

loadConfig(NOTECARD_NAME, config, () => {
  startListening()

  onConfigChanged(NOTECARD_NAME, config, () => {
    ll.Say(DEBUG_CHANNEL, "Settings notecard changed, re-registering listener...")
    startListening()
  })
})
