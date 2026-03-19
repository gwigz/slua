/// <reference path="../../packages/types/index.d.ts" />

// Change this to a unique channel for your deployment
const PRIVATE_CHANNEL = -1731704569

/** How often to reposition (seconds) */
const FOLLOW_INTERVAL = 0.1

/** Delay before delivering relays, to let natural chat arrive first for dedup */
const RELAY_DELAY = 0.1

/** How long to keep heard messages for dedup */
const DEDUP_WINDOW = 2

/** Max entries before wiping the dedup table */
const DEDUP_MAX = 50

// State

const owner = ll.GetOwner()

let assignedAvatar: UUID | undefined
let listenHandle: number | undefined
let hearHandle: number | undefined

/** Recently heard messages for dedup against incoming relays */
let recentMessages: Record<string, number> = {}
let recentCount = 0

// Listen for coordinator/sender commands

// TODO: types don't allow for `""` or `NULL_KEY` here
ll.Listen(PRIVATE_CHANNEL, "", new UUID(""), "")

LLEvents.on("listen", (channel, _name, id, text) => {
  if (channel === PRIVATE_CHANNEL) {
    if (ll.GetOwnerKey(id) !== owner) {
      return
    }

    handlePrivateMessage(text)
    return
  }

  if (channel !== 0 || !assignedAvatar) {
    return
  }

  if (id === assignedAvatar) {
    // Forward assigned avatar's chat to sender for relay routing
    ll.RegionSay(PRIVATE_CHANNEL, `CHAT|${tostring(assignedAvatar)}|${text}`)
    return
  }

  // Track chat heard naturally for dedup against incoming relays
  if (recentCount >= DEDUP_MAX) {
    recentMessages = {}
    recentCount = 0
  }

  const hash = tostring(id) + "|" + text

  if (recentMessages[hash] === undefined) {
    recentCount++
  }

  recentMessages[hash] = ll.GetTime()
})

// Private channel commands

function handlePrivateMessage(text: string) {
  // Relayed message from sender
  if (text.startsWith("RELAY|")) {
    handleRelayedMessage(text)
    return
  }

  // Assignment from coordinator
  if (text.startsWith("ASSIGN|")) {
    assignAvatar(new UUID(text.substring(7)))
    return
  }

  if (text === "UNASSIGN") {
    unassignAvatar()
  }

  if (text === "KILL") {
    ll.Die()
    return
  }
}

function assignAvatar(avatar: UUID) {
  if (listenHandle !== undefined) {
    ll.ListenRemove(listenHandle)
  }

  if (hearHandle !== undefined) {
    ll.ListenRemove(hearHandle)
  }

  assignedAvatar = avatar
  listenHandle = ll.Listen(0, "", avatar, "")
  hearHandle = ll.Listen(0, "", new UUID(""), "")

  // Rename to * so /me messages display as: * secondlife:///app/...
  ll.SetObjectName("*")

  followAvatar()
}

function unassignAvatar() {
  if (listenHandle !== undefined) {
    ll.ListenRemove(listenHandle)
    listenHandle = undefined
  }

  if (hearHandle !== undefined) {
    ll.ListenRemove(hearHandle)
    hearHandle = undefined
  }

  assignedAvatar = undefined
  recentMessages = {}
  recentCount = 0
}

// Following

function followAvatar() {
  if (!assignedAvatar) {
    return
  }

  const details = ll.GetObjectDetails(assignedAvatar, [OBJECT_POS])

  if (details.length === 0) {
    return
  }

  const avatarPos = details[0] as vector

  ll.SetRegionPos(avatarPos)
}

LLTimers.every(FOLLOW_INTERVAL, () => followAvatar())

// Receiving relay messages from sender
// Format: "RELAY|speakerId|message"

function formatRelayMessage(speakerId: string, message: string): string {
  const link = `secondlife:///app/agent/${speakerId}/inspect`

  if (message.startsWith("/me'")) {
    return `/me ${link}${message.substring(3)}`
  }

  if (message.startsWith("/me ")) {
    return `/me ${link} ${message.substring(4)}`
  }

  return `/me ${link}: ${message}`
}

function handleRelayedMessage(text: string) {
  if (!assignedAvatar) {
    return
  }

  // "RELAY|<36-char-uuid>|<message>"
  const speakerId = text.substring(6, 42)
  const message = text.substring(43)
  const hash = speakerId + "|" + message

  // Buffer relay briefly to let natural chat arrive first for dedup
  LLTimers.once(RELAY_DELAY, () => {
    if (!assignedAvatar) {
      return
    }

    const now = ll.GetTime()

    if (recentMessages[hash] !== undefined && now - recentMessages[hash] < DEDUP_WINDOW) {
      return
    }

    if (recentMessages[hash] === undefined) {
      recentCount++
    }

    recentMessages[hash] = now

    // Clean up expired entries
    for (const key in recentMessages) {
      if (now - recentMessages[key] >= DEDUP_WINDOW) {
        recentMessages[key] = undefined!
        recentCount--
      }
    }

    ll.RegionSayTo(assignedAvatar, 0, formatRelayMessage(speakerId, message))
  })
}
