/// <reference path="../../packages/types/index.d.ts" />

// Sender script -- lives in the same linkset as the coordinator.
// Receives CHAT messages from listeners, resolves assignments via linkset data,
// and routes RELAY messages to out-of-range avatars' listeners.

// This helps prevent particle effects from messages sent by followers,
// but also provides a single source to mute, if desired.

// Change this to a unique channel for your deployment
const PRIVATE_CHANNEL = -1731704569
const SAY_RANGE = tonumber(ll.GetEnv("chat_range"))!

const owner = ll.GetOwner()

// TODO: types don't allow for `""` or `NULL_KEY` here
ll.Listen(PRIVATE_CHANNEL, "", new UUID(""), "")

LLEvents.on("listen", (channel, _name, id, text) => {
  if (channel !== PRIVATE_CHANNEL) {
    return
  }

  if (ll.GetOwnerKey(id) !== owner) {
    return
  }

  if (!text.startsWith("CHAT|")) {
    return
  }

  // Format: "CHAT|<36-char-uuid>|<message>"
  const speakerId = new UUID(text.substring(5, 41))
  const message = text.substring(42)

  relayToOutOfRange(speakerId, message)
})

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

    const agentDetails = ll.GetObjectDetails(agent, [OBJECT_POS])

    if (agentDetails.length === 0) {
      continue
    }

    const agentPos = agentDetails[0] as vector
    const distance = ll.VecDist(speakerPos, agentPos)

    if (distance <= SAY_RANGE) {
      continue
    }

    // Look up this avatar's listener via linkset data
    const listenerKey = ll.LinksetDataRead(`a:${tostring(agent)}`)

    if (listenerKey === "") {
      continue
    }

    const listener = new UUID(listenerKey)

    ll.RegionSayTo(listener, PRIVATE_CHANNEL, relayText)
  }
}
