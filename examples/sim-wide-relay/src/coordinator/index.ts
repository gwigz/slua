/**
 * Sim-Wide Chat Relay — pool coordinator
 *
 * Manages a dynamic pool of listener objects that follow avatars around
 * the region. When an avatar arrives, a free listener is assigned and
 * positioned near them. When they leave, the listener is reclaimed.
 *
 * Listeners are rezzed in batches to avoid overflowing the event queue.
 * The pool auto-scales between POOL_BUFFER and POOL_BUFFER_MAX, and a
 * periodic verify pass replaces any listeners that have gone missing.
 *
 * Two-way linkset data mappings (l:<listener> -> avatar, a:<avatar> ->
 * listener) let the sender script resolve assignments without KV lookups.
 *
 * @link https://github.com/gwigz/slua/tree/main/examples/sim-wide-relay
 */

import { NOTECARD_NAME, config } from "./constants"
import { loadConfig, onConfigChanged } from "@gwigz/slua-modules/config"
import { commandChannel, sign } from "../shared"

// Pool state

const poolSize = tonumber(ll.GetEnv("agent_limit"))!

/** Avatar string key -> listener UUID */
const assignedListeners: Record<string, UUID | undefined> = {}

/** Unassigned listener UUIDs */
let freeListeners: UUID[] = []

/** Tracked timers so we can cancel them on pool restart */
let activeTimers: LLTimerCallback[] = []

function cancelActiveTimers() {
  for (const cb of activeTimers) {
    LLTimers.off(cb)
  }

  activeTimers = []
}

function rezBatched(count: number) {
  const pos = ll.GetPos()
  const rot = ll.GetRot()

  let remaining = count

  function rezBatch() {
    const startString = `${config.PRIVATE_CHANNEL}|${config.SIGN_NONCE}|${config.SIGN_WINDOW}`
    const batch = math.min(config.REZ_BATCH_SIZE, remaining)

    for (const _ of $range(1, batch)) {
      ll.RezObjectWithParams(config.LISTENER_OBJECT, [
        REZ_POS,
        pos,
        0,
        0,
        REZ_ROT,
        rot,
        0,
        REZ_PARAM_STRING,
        startString,
      ])
    }

    remaining -= batch

    if (remaining > 0) {
      LLTimers.once(1, rezBatch)
    }
  }

  rezBatch()
}

// Track rezzed listeners

LLEvents.on("object_rez", (rezzedId) => {
  freeListeners.push(rezzedId)
})

// Linkset data -- shared with sender script to route messages without KV lookups.
// Two-way mapping: l:<listenerUUID> -> avatarUUID, a:<avatarUUID> -> listenerUUID

function writeAssignment(avatar: UUID, listener: UUID) {
  ll.LinksetDataWrite(`l:${tostring(listener)}`, tostring(avatar))
  ll.LinksetDataWrite(`a:${tostring(avatar)}`, tostring(listener))
}

function clearAssignment(avatarKey: string, listener: UUID) {
  ll.LinksetDataWrite(`l:${tostring(listener)}`, "")
  ll.LinksetDataWrite(`a:${avatarKey}`, "")
}

// Avatar polling

function pollAgents() {
  const agents = ll.GetAgentList(AGENT_LIST_REGION, [])

  // Detect departures
  const agentKeys: Record<string, boolean> = {}

  for (const agent of agents) {
    agentKeys[tostring(agent)] = true
  }

  for (const key in assignedListeners) {
    if (agentKeys[key]) {
      continue
    }

    const listener = assignedListeners[key]!

    ll.RegionSayTo(
      listener,
      config.PRIVATE_CHANNEL,
      sign("UNASSIGN", config.SIGN_NONCE, config.SIGN_WINDOW),
    )

    clearAssignment(key, listener)

    assignedListeners[key] = undefined
    freeListeners.push(listener)
  }

  // Detect arrivals
  for (const agent of agents) {
    const key = tostring(agent)

    if (assignedListeners[key] === undefined && !config.IGNORED_AVATARS.includes(key)) {
      assignListener(agent)
    }
  }

  ensureBuffer()
  updateDiagnostics()
}

function assignListener(avatar: UUID) {
  if (freeListeners.length === 0) {
    ll.Say(DEBUG_CHANNEL, "Pool exhausted, no listener for " + ll.Key2Name(avatar))
    return
  }

  const listener = freeListeners.pop()!
  const key = tostring(avatar)

  assignedListeners[key] = listener

  writeAssignment(avatar, listener)

  ll.RegionSayTo(
    listener,
    config.PRIVATE_CHANNEL,
    sign("ASSIGN|" + key, config.SIGN_NONCE, config.SIGN_WINDOW),
  )

  ll.RegionSayTo(
    avatar,
    0,
    config.WELCOME_MESSAGE.replace(
      "{help}",
      `secondlife:///app/chat/${commandChannel(key, config.SIGN_NONCE)}/help`,
    ),
  )
}

// Verify listeners still exist in region, rez replacements for any missing

function verifyListeners() {
  let rezCount = 0

  // Check free pool
  const remaining: UUID[] = []

  for (const listener of freeListeners) {
    if (ll.GetObjectDetails(listener, [OBJECT_POS]).length > 0) {
      remaining.push(listener)
    } else {
      rezCount++
    }
  }

  freeListeners = remaining

  // Check assigned listeners
  for (const key in assignedListeners) {
    const listener = assignedListeners[key]!

    if (ll.GetObjectDetails(listener, [OBJECT_POS]).length === 0) {
      clearAssignment(key, listener)

      assignedListeners[key] = undefined
      rezCount++
    }
  }

  if (rezCount > 0) {
    ll.Say(DEBUG_CHANNEL, `${rezCount} listener(s) missing, rezzing replacements...`)

    rezBatched(rezCount)
  }
}

// Dynamic pool sizing

function ensureBuffer() {
  const needed = config.POOL_BUFFER - freeListeners.length

  if (needed > 0) {
    const room = poolSize - totalListeners()
    const toRez = math.min(needed, room)

    if (toRez > 0) {
      rezBatched(toRez)
    }
  }
}

function cullExcess() {
  while (freeListeners.length > config.POOL_BUFFER_MAX) {
    const listener = freeListeners.pop()!
    ll.RegionSayTo(
      listener,
      config.PRIVATE_CHANNEL,
      sign("KILL", config.SIGN_NONCE, config.SIGN_WINDOW),
    )
  }
}

// Diagnostics hover text

function assignedCount() {
  let count = 0
  for (const _ in assignedListeners) count++
  return count
}

function totalListeners() {
  return assignedCount() + freeListeners.length
}

function updateDiagnostics() {
  const assigned = assignedCount()
  const free = freeListeners.length
  const total = assigned + free
  const text = `Sim-Wide Chat\n—\nPool: ${total}/${poolSize}\nAssigned: ${assigned} ⋅ Free: ${free}`
  const color = free === 0 ? new Vector(1, 0.3, 0.3) : new Vector(0.5, 1, 0.5)

  ll.SetLinkPrimitiveParamsFast(LINK_THIS, [PRIM_TEXT, text, color, 1.0])
}

// Startup

function killAllListeners() {
  ll.RegionSay(config.PRIVATE_CHANNEL, sign("KILL", config.SIGN_NONCE, config.SIGN_WINDOW))
}

function startPool() {
  // Cancel timers from a previous run before anything else
  cancelActiveTimers()

  // Kill any leftover listeners from a previous run
  killAllListeners()

  // Clear stale assignment data from previous run (preserves block lists)
  ll.LinksetDataDeleteFound("^[la]:", "")

  // Clear JS-side assignments
  for (const key in assignedListeners) {
    assignedListeners[key] = undefined
  }
  freeListeners = []

  const initialPool = config.POOL_BUFFER

  ll.SetLinkPrimitiveParamsFast(LINK_THIS, [
    PRIM_TEXT,
    `Sim-Wide Chat\n—\nRezzing ${initialPool} listeners...`,
    new Vector(1, 1, 0),
    1.0,
  ])

  rezBatched(initialPool)

  // Wait for initial listeners to register via object_rez before starting
  function rezCheck() {
    if (freeListeners.length < initialPool) {
      return
    }

    LLTimers.off(rezCheck)

    pollAgents()

    activeTimers.push(LLTimers.every(config.POLL_INTERVAL, pollAgents))

    activeTimers.push(
      LLTimers.every(30, () => {
        verifyListeners()
        cullExcess()
      }),
    )
  }

  activeTimers.push(LLTimers.every(1, rezCheck))
}

loadConfig(NOTECARD_NAME, { config }, (ok, error) => {
  if (!ok) {
    console.log(`Config load failed: ${error}`)
    return
  }

  startPool()

  // Snapshot signing params so we can kill old listeners with their expected credentials
  let prev = {
    nonce: config.SIGN_NONCE,
    window: config.SIGN_WINDOW,
    channel: config.PRIVATE_CHANNEL,
  }

  onConfigChanged(NOTECARD_NAME, { config }, (ok, error) => {
    if (!ok) {
      console.log(`Config reload failed: ${error}`)
      return
    }

    ll.Say(DEBUG_CHANNEL, "Settings notecard changed, restarting pool...")

    // Kill old listeners using the credentials they recognize
    ll.RegionSay(prev.channel, sign("KILL", prev.nonce, prev.window))

    prev = { nonce: config.SIGN_NONCE, window: config.SIGN_WINDOW, channel: config.PRIVATE_CHANNEL }

    startPool()
  })
})
