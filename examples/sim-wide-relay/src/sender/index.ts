/**
 * Sim-Wide Chat Relay — message router and sender
 *
 * Lives in the same linkset as the coordinator. Receives CHAT messages
 * from listeners, checks which avatars are out of range, and routes
 * RELAY messages to the appropriate listeners for delivery.
 *
 * When a listener confirms the relay was not heard naturally, this
 * script formats the message with a clickable profile link and delivers
 * it via ll.RegionSayTo. The object name is set to "*" so /me messages
 * display cleanly.
 *
 * @link https://github.com/gwigz/slua/tree/main/examples/sim-wide-relay
 */

import { NOTECARD_NAME, config } from "./constants"
import { loadConfig, onConfigChanged } from "@gwigz/slua-modules/config"
import { commandChannel, sign, verify } from "../shared"

const SAY_RANGE = tonumber(ll.GetEnv("chat_range"))!

const owner = ll.GetOwner()

function profileLink(key: string): string {
  return `secondlife:///app/agent/${key}/inspect`
}

/** Extract a UUID from a raw key or secondlife:///app/agent/<UUID>/... URI */
function extractKey(input: string): string {
  const prefix = "secondlife:///app/agent/"

  if (input.startsWith(prefix)) {
    return input.substring(prefix.length, prefix.length + 36)
  }

  return input
}

/** Parse the argument from a command, trying each alias prefix */
function parseCommandArg(cmd: string, text: string, ...aliases: string[]): string | undefined {
  for (const alias of aliases) {
    if (cmd.startsWith(alias + " ")) {
      return extractKey(text.substring(alias.length + 1).trim())
    }
  }

  return undefined
}

function formatRelayMessage(speakerId: string, message: string): string {
  const link = profileLink(speakerId)

  if (message.startsWith("/me'")) {
    return `/me ${link}${message.substring(3)}`
  }

  if (message.startsWith("/me ")) {
    return `/me ${link} ${message.substring(4)}`
  }

  return `/me ${link}: ${message}`
}

// Block list storage: b:<avatarUUID> -> CSV of blocked UUIDs

function getBlockList(avatarKey: string): string[] {
  const data = ll.LinksetDataRead(`b:${avatarKey}`)

  if (data === "") {
    return []
  }

  return data.split(",")
}

function setBlockList(avatarKey: string, list: string[]) {
  if (list.length === 0) {
    ll.LinksetDataWrite(`b:${avatarKey}`, "")
  } else {
    ll.LinksetDataWrite(`b:${avatarKey}`, list.join(","))
  }
}

function sendCommandResponse(avatarId: UUID, message: string) {
  ll.RegionSayTo(avatarId, 0, `/me ${message}`)
}

function handleCommand(avatarId: UUID, text: string) {
  const avatarKey = tostring(avatarId)
  const cmd = text.toLowerCase()

  if (cmd === "help") {
    const ch = commandChannel(avatarKey, config.SIGN_NONCE)

    sendCommandResponse(
      avatarId,
      "Sim-Wide Chat Commands:\n" +
        `  [secondlife:///app/chat/${ch}/block Block avatar]\n` +
        `  [secondlife:///app/chat/${ch}/unblock Unblock avatar]\n` +
        `  [secondlife:///app/chat/${ch}/blocked Show blocked list]\n` +
        "Alternatively type in local chat: !block @mention / !unblock @mention (or UUID)",
    )
    return
  }

  if (cmd === "mute" || cmd === "block") {
    ll.MessageLinked(LINK_THIS, 0, "block", avatarKey)
    return
  }

  if (cmd === "unmute" || cmd === "unblock") {
    if (getBlockList(avatarKey).length === 0) {
      sendCommandResponse(avatarId, "Your block list is empty")
      return
    }

    ll.MessageLinked(LINK_THIS, 0, "unblock", avatarKey)
    return
  }

  const blockTarget = parseCommandArg(cmd, text, "mute", "block")

  if (blockTarget !== undefined) {
    if (blockTarget.length !== 36) {
      sendCommandResponse(avatarId, "Invalid UUID format")
      return
    }

    if (blockTarget === avatarKey) {
      sendCommandResponse(avatarId, "You cannot block yourself")
      return
    }

    const blocks = getBlockList(avatarKey)

    if (blocks.includes(blockTarget)) {
      sendCommandResponse(avatarId, "That avatar is already blocked")
      return
    }

    if (blocks.length >= config.MAX_BLOCKS) {
      sendCommandResponse(
        avatarId,
        `Block list full (max ${config.MAX_BLOCKS}), unblock someone first`,
      )
      return
    }

    blocks.push(blockTarget)
    setBlockList(avatarKey, blocks)

    sendCommandResponse(avatarId, `Blocked ${profileLink(blockTarget)}`)
    return
  }

  const unblockTarget = parseCommandArg(cmd, text, "unmute", "unblock")

  if (unblockTarget !== undefined) {
    const blocks = getBlockList(avatarKey)
    const index = blocks.indexOf(unblockTarget)

    if (index === -1) {
      sendCommandResponse(avatarId, "That avatar is not on your block list")
      return
    }

    setBlockList(
      avatarKey,
      blocks.filter((_, i) => i !== index),
    )

    sendCommandResponse(avatarId, `Unblocked ${profileLink(unblockTarget)}`)

    return
  }

  if (cmd === "blocked") {
    const blocks = getBlockList(avatarKey)

    if (blocks.length === 0) {
      sendCommandResponse(avatarId, "Your block list is empty")
      return
    }

    sendCommandResponse(avatarId, "Blocked: " + blocks.map((key) => profileLink(key)).join(", "))
    return
  }

  sendCommandResponse(avatarId, `Unknown command: ${text}`)
}

function relayToOutOfRange(speakerId: UUID, message: string) {
  const speakerDetails = ll.GetObjectDetails(speakerId, [OBJECT_POS])

  if (speakerDetails.length === 0) {
    return
  }

  const speakerPos = speakerDetails[0] as Vector
  const agents = ll.GetAgentList(AGENT_LIST_REGION, [])
  const speakerKey = tostring(speakerId)
  const relayText = `RELAY|${speakerKey}|${message}`

  for (const agent of agents) {
    if (agent === speakerId) {
      continue
    }

    const agentKey = tostring(agent)

    if (config.IGNORED_AVATARS.includes(agentKey)) {
      continue
    }

    // Cheap linkset read first -- skip agents with no listener
    const listenerKey = ll.LinksetDataRead(`a:${agentKey}`)

    if (listenerKey === "") {
      continue
    }

    // Check per-user block list
    const blockData = ll.LinksetDataRead(`b:${agentKey}`)

    if (blockData !== "" && blockData.includes(speakerKey)) {
      continue
    }

    const agentDetails = ll.GetObjectDetails(agent, [OBJECT_POS])

    if (agentDetails.length === 0) {
      continue
    }

    const agentPos = agentDetails[0] as Vector
    const distance = ll.VecDist(speakerPos, agentPos)

    if (distance <= SAY_RANGE) {
      continue
    }

    ll.RegionSayTo(
      new UUID(listenerKey),
      config.PRIVATE_CHANNEL,
      sign(relayText, config.SIGN_NONCE, config.SIGN_WINDOW),
    )
  }
}

let listenHandle: number | undefined

function startListening() {
  if (listenHandle !== undefined) {
    ll.ListenRemove(listenHandle)
  }

  listenHandle = ll.Listen(config.PRIVATE_CHANNEL, "", NULL_KEY, "")
}

// Receive completed TextBox commands from dialog script
LLEvents.on("link_message", (_link, _num, text, avatarKey) => {
  if (!text.startsWith("block ") && !text.startsWith("unblock ")) {
    return
  }

  handleCommand(new UUID(avatarKey), text)
})

LLEvents.on("listen", (channel, _name, id, text) => {
  if (channel !== config.PRIVATE_CHANNEL) {
    return
  }

  if (ll.GetOwnerKey(id) !== owner) {
    return
  }

  const payload = verify(text, config.SIGN_NONCE, config.SIGN_WINDOW)

  if (payload === undefined) {
    return
  }

  if (payload.startsWith("CHAT|")) {
    // Format: "CHAT|<36-char-UUID>|<message>"
    const speakerKey = payload.substring(5, 41)

    if (config.IGNORED_AVATARS.includes(speakerKey)) {
      return
    }

    relayToOutOfRange(new UUID(speakerKey), payload.substring(42))
    return
  }

  if (payload.startsWith("SAY|")) {
    // Format: "SAY|<36-char-avatar-UUID>|<36-char-speaker-UUID>|<message>"
    const avatar = new UUID(payload.substring(4, 40))
    const speakerId = payload.substring(41, 77)
    const message = payload.substring(78)

    ll.RegionSayTo(avatar, 0, formatRelayMessage(speakerId, message))
    return
  }

  if (payload.startsWith("CMD|")) {
    // Format: "CMD|<36-char-UUID>|<text>"
    const avatarId = new UUID(payload.substring(4, 40))
    const cmdText = payload.substring(41)

    handleCommand(avatarId, cmdText)
    return
  }
})

// Rename to * so /me messages display as: * secondlife:///app/...
ll.SetObjectName("*")

loadConfig(NOTECARD_NAME, { config }, (ok, error) => {
  if (!ok) {
    print(`Config load failed: ${error}`)
    return
  }

  startListening()

  onConfigChanged(NOTECARD_NAME, { config }, (ok, error) => {
    if (!ok) {
      print(`Config reload failed: ${error}`)
      return
    }

    ll.Say(DEBUG_CHANNEL, "Settings notecard changed, re-registering listener...")
    startListening()
  })
})
