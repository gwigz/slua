import { IGNORED_AVATARS, PRIVATE_CHANNEL, sign } from "./shared"

/** Listener object name in inventory */
const LISTENER_OBJECT = "Relay Listener"

/** How often to poll for avatar changes (seconds) */
const POLL_INTERVAL = 3

// Pool state

const poolSize = tonumber(ll.GetEnv("agent_limit"))!

/** Minimum free listeners to keep as buffer */
const POOL_BUFFER = 10

/** Maximum free listeners before culling excess */
const POOL_BUFFER_MAX = 20

/** Avatar string key -> listener UUID */
const assignedListeners: Record<string, UUID | undefined> = {}

/** Unassigned listener UUIDs */
let freeListeners: UUID[] = []

// Rez in batches -- rezzing too many at once can overflow the event queue
// and cause object_rez events to be dropped, losing track of listeners.

const REZ_BATCH_SIZE = 20

function rezBatched(count: number) {
  const pos = ll.GetPos()
  const rot = ll.GetRot()
  let remaining = count

  function rezBatch() {
    const batch = math.min(REZ_BATCH_SIZE, remaining)

    for (let i = 0; i < batch; i++) {
      ll.RezObject(LISTENER_OBJECT, pos, new Vector(0, 0, 0), rot, 0)
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

    ll.RegionSayTo(listener, PRIVATE_CHANNEL, sign("UNASSIGN"))

    clearAssignment(key, listener)

    assignedListeners[key] = undefined
    freeListeners.push(listener)
  }

  // Detect arrivals
  for (const agent of agents) {
    const key = tostring(agent)

    if (assignedListeners[key] === undefined && !IGNORED_AVATARS.includes(key)) {
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

  ll.RegionSayTo(listener, PRIVATE_CHANNEL, sign("ASSIGN|" + key))
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
  const needed = POOL_BUFFER - freeListeners.length

  if (needed > 0) {
    const room = poolSize - totalListeners()
    const toRez = math.min(needed, room)

    if (toRez > 0) {
      rezBatched(toRez)
    }
  }
}

function cullExcess() {
  while (freeListeners.length > POOL_BUFFER_MAX) {
    const listener = freeListeners.pop()!
    ll.RegionSayTo(listener, PRIVATE_CHANNEL, sign("KILL"))
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
  const text = `Sim-Wide Chat\nPool: ${total}/${poolSize}\nAssigned: ${assigned} ⋅ Free: ${free}`
  const color = free === 0 ? new Vector(1, 0.3, 0.3) : new Vector(0.5, 1, 0.5)

  ll.SetLinkPrimitiveParamsFast(LINK_THIS, [PRIM_TEXT, text, color, 1.0])
}

// Startup

// Kill any leftover listeners from a previous run
ll.RegionSay(PRIVATE_CHANNEL, sign("KILL"))

// Clear stale linkset data from previous run
ll.LinksetDataReset()

const initialPool = POOL_BUFFER

ll.SetLinkPrimitiveParamsFast(LINK_THIS, [
  PRIM_TEXT,
  `Sim-Wide Chat\nRezzing ${initialPool} listeners...`,
  new Vector(1, 1, 0),
  1.0,
])

rezBatched(initialPool)

// Wait for initial listeners to register via object_rez before starting
const rezCheck = LLTimers.every(1, () => {
  if (freeListeners.length < initialPool) {
    return
  }

  LLTimers.off(rezCheck)

  pollAgents()

  LLTimers.every(POLL_INTERVAL, pollAgents)

  LLTimers.every(30, () => {
    verifyListeners()
    cullExcess()
  })
})
