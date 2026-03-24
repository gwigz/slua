/**
 * Sim-Wide Chat Relay — listener follower
 *
 * Rezzed by the coordinator and assigned to a single avatar. Follows
 * the avatar at a short interval and listens on channel 0 near them.
 *
 * When the assigned avatar speaks, the message is forwarded to the
 * sender script via PRIVATE_CHANNEL. When a RELAY message arrives from
 * the sender, it is buffered briefly to allow natural chat to arrive
 * first, then deduplicated and sent back as a SAY request for delivery.
 *
 * @link https://github.com/gwigz/slua/tree/main/examples/sim-wide-relay
 */

import { NOTECARD_NAME, config } from "./constants"
import { loadConfig, onConfigChanged } from "@gwigz/slua-modules/config"
import { commandChannel, sign, verify } from "../shared"

// State

const owner = ll.GetOwner()

let assignedAvatar: UUID | undefined
let coordinatorId: UUID | undefined
let hearHandle: number | undefined
let commandHandle: number | undefined
let privateHandle: number | undefined
let followTimer: LLTimerCallback | undefined
let lastPosition: vector | undefined

function startListening() {
  if (privateHandle !== undefined) {
    ll.ListenRemove(privateHandle)
  }

  privateHandle = ll.Listen(config.PRIVATE_CHANNEL, "", NULL_KEY, "")
}

/** Recently heard messages for dedup against incoming relays */
let recentMessages: Record<string, number> = {}
let recentCount = 0

function forwardCommand(avatar: UUID, text: string) {
  ll.RegionSay(
    config.PRIVATE_CHANNEL,
    sign(`CMD|${tostring(avatar)}|${text}`, config.SIGN_NONCE, config.SIGN_WINDOW),
  )
}

// Listen for coordinator/sender commands

LLEvents.on("listen", (channel, _name, id, text) => {
  if (channel === config.PRIVATE_CHANNEL) {
    if (ll.GetOwnerKey(id) !== owner) {
      return
    }

    const payload = verify(text, config.SIGN_NONCE, config.SIGN_WINDOW)

    if (payload === undefined) {
      return
    }

    handlePrivateMessage(id, payload)
    return
  }

  if (!assignedAvatar) {
    return
  }

  // Command channel from assigned avatar
  if (channel !== 0 && id === assignedAvatar) {
    forwardCommand(assignedAvatar, text)
    return
  }

  if (channel !== 0) {
    return
  }

  if (id === assignedAvatar) {
    // !-prefixed messages are commands, not chat
    if (text.startsWith("!")) {
      forwardCommand(assignedAvatar, text.substring(1))
      return
    }

    // Forward assigned avatar's chat to sender for relay routing
    ll.RegionSay(
      config.PRIVATE_CHANNEL,
      sign(`CHAT|${tostring(assignedAvatar)}|${text}`, config.SIGN_NONCE, config.SIGN_WINDOW),
    )
    return
  }

  // Track chat heard naturally for dedup against incoming relays
  if (recentCount >= config.DEDUP_MAX) {
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

function handlePrivateMessage(senderId: UUID, text: string) {
  // Relayed message from sender
  if (text.startsWith("RELAY|")) {
    handleRelayedMessage(text)
    return
  }

  // Assignment from coordinator
  if (text.startsWith("ASSIGN|")) {
    coordinatorId = senderId
    assignAvatar(new UUID(text.substring(7)))
    return
  }

  if (text === "UNASSIGN") {
    unassignAvatar(senderId)
    return
  }

  if (text === "KILL") {
    ll.Die()
    return
  }
}

function assignAvatar(avatar: UUID) {
  if (hearHandle !== undefined) {
    ll.ListenRemove(hearHandle)
    hearHandle = undefined
  }

  if (commandHandle !== undefined) {
    ll.ListenRemove(commandHandle)
    commandHandle = undefined
  }

  assignedAvatar = avatar
  lastPosition = undefined
  hearHandle = ll.Listen(0, "", NULL_KEY, "")
  commandHandle = ll.Listen(commandChannel(tostring(avatar), config.SIGN_NONCE), "", avatar, "")

  followAvatar()
  startFollowTimer()
}

function unassignAvatar(senderId?: UUID) {
  stopFollowTimer()

  if (hearHandle !== undefined) {
    ll.ListenRemove(hearHandle)
    hearHandle = undefined
  }

  if (commandHandle !== undefined) {
    ll.ListenRemove(commandHandle)
    commandHandle = undefined
  }

  assignedAvatar = undefined
  lastPosition = undefined
  recentMessages = {}
  recentCount = 0

  // Return to the coordinator that unassigned us
  const target = senderId ?? coordinatorId

  if (target) {
    returnToObject(target)
  }
}

// Following

function startFollowTimer() {
  stopFollowTimer()
  followTimer = LLTimers.every(config.FOLLOW_INTERVAL, followAvatar)
}

function stopFollowTimer() {
  if (followTimer !== undefined) {
    LLTimers.off(followTimer)
    followTimer = undefined
  }
}

function moveTo(targetPos: vector) {
  const myPos = ll.GetPos()
  const distance = ll.VecDist(myPos, targetPos)

  if (distance < 0.01) {
    return
  }

  if (distance >= 10) {
    ll.SetRegionPos(targetPos)
  }

  ll.SetLinkPrimitiveParamsFast(LINK_THIS, [PRIM_POSITION, targetPos])
}

function followAvatar() {
  if (!assignedAvatar) {
    return
  }

  const details = ll.GetObjectDetails(assignedAvatar, [OBJECT_POS])

  if (details.length === 0) {
    return
  }

  const avatarPos = details[0] as vector

  if (lastPosition !== undefined && ll.VecDist(lastPosition, avatarPos) < 0.01) {
    return
  }

  lastPosition = avatarPos

  moveTo(avatarPos)
}

function returnToObject(objectId: UUID) {
  const details = ll.GetObjectDetails(objectId, [OBJECT_POS])

  if (details.length === 0) {
    return
  }

  moveTo(details[0] as vector)
}

// Receiving relay messages from sender
// Format: "RELAY|speakerId|message"

function handleRelayedMessage(text: string) {
  if (!assignedAvatar) {
    return
  }

  // "RELAY|<36-char-uuid>|<message>"
  const speakerId = text.substring(6, 42)
  const message = text.substring(43)
  const hash = speakerId + "|" + message

  // Buffer relay briefly to let natural chat arrive first for dedup
  LLTimers.once(config.RELAY_DELAY, () => {
    if (!assignedAvatar) {
      return
    }

    const now = ll.GetTime()

    if (recentMessages[hash] !== undefined && now - recentMessages[hash] < config.DEDUP_WINDOW) {
      return
    }

    if (recentMessages[hash] === undefined) {
      recentCount++
    }

    recentMessages[hash] = now

    // Send back to sender for delivery
    ll.RegionSay(
      config.PRIVATE_CHANNEL,
      sign(
        `SAY|${tostring(assignedAvatar)}|${speakerId}|${message}`,
        config.SIGN_NONCE,
        config.SIGN_WINDOW,
      ),
    )

    // Clean up expired entries
    for (const key in recentMessages) {
      if (now - recentMessages[key] >= config.DEDUP_WINDOW) {
        recentMessages[key] = undefined!
        recentCount--
      }
    }
  })
}

loadConfig(NOTECARD_NAME, config, () => {
  startListening()

  onConfigChanged(NOTECARD_NAME, config, () => {
    ll.Say(DEBUG_CHANNEL, "Settings notecard changed, re-registering listener...")

    startListening()
  })
})
