import { IGNORED_AVATARS, PRIVATE_CHANNEL, sign, verify } from "./shared"

// Sender script -- lives in the same linkset as the coordinator.
// Receives CHAT messages from listeners, resolves assignments via linkset data,
// and routes RELAY messages to out-of-range avatars' listeners.

// This helps prevent particle effects from messages sent by followers,
// but also provides a single source to mute, if desired.

const SAY_RANGE = tonumber(ll.GetEnv("chat_range"))!

const owner = ll.GetOwner()

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

function relayToOutOfRange(speakerId: UUID, message: string) {
  const speakerDetails = ll.GetObjectDetails(speakerId, [OBJECT_POS])

  if (speakerDetails.length === 0) {
    return
  }

  const speakerPos = speakerDetails[0] as vector
  const agents = ll.GetAgentList(AGENT_LIST_REGION, [])
  const relayText = `RELAY|${tostring(speakerId)}|${message}`

  for (const agent of agents) {
    if (agent === speakerId) {
      continue
    }

    const agentKey = tostring(agent)

    if (IGNORED_AVATARS.includes(agentKey)) {
      continue
    }

    // Cheap linkset read first -- skip agents with no listener
    const listenerKey = ll.LinksetDataRead(`a:${agentKey}`)

    if (listenerKey === "") {
      continue
    }

    const agentDetails = ll.GetObjectDetails(agent, [OBJECT_POS])

    if (agentDetails.length === 0) {
      continue
    }

    const agentPos = agentDetails[0] as vector
    const distance = ll.VecDist(speakerPos, agentPos)

    if (distance <= SAY_RANGE) {
      continue
    }

    ll.RegionSayTo(new UUID(listenerKey), PRIVATE_CHANNEL, sign(relayText))
  }
}

LLEvents.on("listen", (channel, _name, id, text) => {
  if (channel !== PRIVATE_CHANNEL) {
    return
  }

  if (ll.GetOwnerKey(id) !== owner) {
    return
  }

  const payload = verify(text)

  if (payload === undefined) {
    return
  }

  if (payload.startsWith("CHAT|")) {
    // Format: "CHAT|<36-char-uuid>|<message>"
    const speakerKey = payload.substring(5, 41)

    if (IGNORED_AVATARS.includes(speakerKey)) {
      return
    }

    relayToOutOfRange(new UUID(speakerKey), payload.substring(42))
    return
  }

  if (payload.startsWith("SAY|")) {
    // Format: "SAY|<36-char-avatar-uuid>|<36-char-speaker-uuid>|<message>"
    const avatar = new UUID(payload.substring(4, 40))
    const speakerId = payload.substring(41, 77)
    const message = payload.substring(78)

    ll.RegionSayTo(avatar, 0, formatRelayMessage(speakerId, message))
    return
  }
})

// Rename to * so /me messages display as: * secondlife:///app/...
ll.SetObjectName("*")

// TODO: types don't allow for `""` or `NULL_KEY` here
ll.Listen(PRIVATE_CHANNEL, "", new UUID(""), "")
