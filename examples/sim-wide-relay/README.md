# Sim-Wide Chat Relay

Three-script relay system that extends public chat (channel 0) across an entire region. Each avatar is assigned a listener object that follows them, captures their chat, and relays it to avatars outside hearing range.

## How it works

1. **Coordinator** rezzes a pool of listener objects (batched to avoid event queue overflow)
2. When an avatar enters the region, the coordinator assigns a free listener and writes the mapping to linkset data
3. The **listener** follows its assigned avatar and forwards any chat to the sender via private channel
4. The **sender** (in the same linkset as the coordinator) resolves the speaker via linkset data, checks distances for all agents, and routes relay messages to out-of-range avatars' listeners
5. The receiving listener delivers the formatted message to its assigned avatar via `llRegionSayTo`

## Scripts

- **`coordinator.ts`** -- Pool management, avatar polling, linkset data assignments
- **`listener.ts`** -- Follows assigned avatar, captures chat, delivers relayed messages
- **`sender.ts`** -- Routes chat between listeners based on distance and linkset data lookups

## Features demonstrated

- **Linkset data** (`ll.LinksetDataWrite`, `ll.LinksetDataRead`) for shared state between scripts in the same object
- **`ll.GetAgentList`** for region-wide avatar detection
- **`ll.GetObjectDetails`** for position lookups and distance checks
- **`ll.RegionSayTo`** for targeted cross-region messaging
- **`ll.SetRegionPos`** for listener repositioning
- **`ll.RezObject`** for dynamic object creation
- **Timer events** for polling and following

## Setup

1. Place the coordinator and sender scripts in the same prim
2. Add the listener object (with the listener script) to the coordinator's inventory as "Relay Listener"
3. The coordinator will rez the pool automatically on startup

## Build

```bash
bunx tstl --project tsconfig.json
```

Output is written to `out/`.
