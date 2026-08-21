# `@gwigz/slua-viewer-client`

Push SLua to the Second Life viewer's external script editor, without touching the viewer UI.

The viewer ships a JSON-RPC 2.0 WebSocket server on `localhost:9020` for external script editing. This is a typed client for that protocol, plus a CLI so a build can deploy itself:

```bash
bun run build && bunx @gwigz/slua-viewer-client push dist/main.slua
```

Compile errors come back with the file and line of your **TypeScript** source, given a source map beside the pushed file, and against the generated output without one. A failed compile exits non-zero.

## Requirements

A viewer with external script editing enabled (`ExternalWebsocketSyncEnable`). The object you are targeting must be published to the editor first; see [Publishing an object](#publishing-an-object).

## Running it

Nothing to install for the one-off commands, `objects`, `logs`, `link` and `pull`:

```bash
bunx @gwigz/slua-viewer-client objects
# or
npx @gwigz/slua-viewer-client objects
```

Once deploying is part of your build, add it as a devDependency and pin it. Package scripts already have `node_modules/.bin` on PATH, so the `slua-viewer` bin is callable by name from there, which a bare shell cannot do:

```bash
bun add -d @gwigz/slua-viewer-client
```

```jsonc
{
  "scripts": {
    "deploy": "bun run build && slua-viewer push --all",
  },
}
```

## Quick start

Select the object in the viewer, then pair it with a name once:

```bash
bunx @gwigz/slua-viewer-client link main
```

After that a deploy is just:

```bash
bun run deploy
```

## CLI

| Command                               | What it does                                 |
| ------------------------------------- | -------------------------------------------- |
| `objects`                             | List objects the viewer has published        |
| `pull <object>/<item> [out]`          | Fetch script or notecard content             |
| `push [file] [object]/[item]`         | Upload and compile, non-zero exit on failure |
| `link <name>`                         | Pair a target with the published object      |
| `reset <object>/<item>`               | Reset a script                               |
| `set-running on\|off <object>/<item>` | Start or stop a script                       |
| `logs`                                | Stream runtime output from published objects |
| `connect`                             | Hold a session: watch, push and tail in one  |
| `status`                              | What the running session is doing            |
| `wait`                                | Block until the next push settles            |
| `mcp`                                 | Serve the session to an agent over MCP       |
| `syntax [defs.lsl\|defs.lua]`         | Dump language definitions                    |

Examples below use the `slua-viewer` bin name, which resolves inside a package script or after a devDependency install. Prefix them with `bunx @gwigz/slua-viewer-client` to run them straight from a shell.

### Output after a push

A save restarts the script, so whatever its `state_entry` says is on the wire within milliseconds, and a command that disconnects as soon as the save returns never sees it. `push` keeps listening for a moment (1.5s) and prints what arrives under the compile result:

```
compiled Main.luau in My Rezzer
say My Rezzer/Main  ready
```

`--tail 10s` widens the window, `--tail` on its own keeps listening until you interrupt it, and `--no-tail` skips it for scripted use. Only output from the object and item just pushed is shown. The result payload carries a `cursor`, which is the point everything the push caused comes after.

A bounded window only covers the restart. Whatever the script says afterwards, when someone touches it or a timer fires, needs a connection that is still open. That is [a session](#a-session), or `logs --follow`.

### Addressing

Targets are `<object>/<item>`, or `<object>/<link>/<item>` for an item in a child prim. The `--object`, `--link` and `--item` flags are equivalent.

The object segment takes a UUID, a name, or an explicit `id:` / `name:` / `desc:` prefix. Items match with or without the display extension, so `Main` and `Main.luau` are the same item. Child prims match on link name, `Name (2)` when siblings share a name, link number, or UUID.

```bash
slua-viewer push dist/main.slua 4f2b0c1e-.../Main
slua-viewer push dist/main.slua "desc:slua:my-project/Main"
slua-viewer push dist/main.slua "My Rezzer/Panel/Main"
```

### Options

| Flag                         | Applies to     | Meaning                                               |
| ---------------------------- | -------------- | ----------------------------------------------------- |
| `--object <id\|name>`        | most           | Target object, same grammar as the object segment     |
| `--item <id\|name>`          | most           | Target inventory item                                 |
| `--link <id\|name>`          | most           | Child prim within the linkset                         |
| `--vm <vm>`                  | `push`         | Compile target: `luau`, `mono`, `lsl2`                |
| `--target <name>`            | `push`         | Deploy a named target from `slua.json`                |
| `--all`                      | `push`         | Deploy every target in `slua.json`                    |
| `--save-back`                | `push`         | Derez back into the source prim after a good compile  |
| `--file <path>`              | `push`, `link` | File to push, or to record when linking               |
| `--key <key>`                | `link`         | Description key to pair on, default `slua:<name>`     |
| `-f`, `--follow`             | `logs`         | Keep streaming, reconnecting if the viewer restarts   |
| `--targets`                  | `logs`         | Only output from items your `slua.json` targets       |
| `--tail [duration]`          | `push`         | Keep listening after the push, `5s`, or until ctrl-c  |
| `--no-tail`                  | `push`         | Push without waiting for output at all                |
| `--watch`/`--no-watch`       | `connect`      | Push when a target's output changes, on by default    |
| `--debounce <ms>`            | `connect`      | How long a target must be quiet first, default `3000` |
| `--edge <edge>`              | `connect`      | `trailing` (default) or `leading`                     |
| `--exec <command>`           | `connect`      | Run a build alongside the session                     |
| `--since <cursor\|duration>` | `logs`, `wait` | Output after a cursor, or from the last `5m`          |
| `--for <duration>`           | `wait`         | How long to block, default `30s`                      |
| `--direct`                   | all            | Talk to the viewer even with a session running        |
| `--wait`                     | most           | Hold the viewer connection open until it publishes    |
| `--port <port>`              | all            | Viewer websocket port, default `9020`                 |
| `--timeout <ms>`             | all            | Request timeout                                       |
| `--json`                     | all            | Machine-readable output on stdout                     |

Keys in `--json` output are camelCase (`objectId`, `primId`, `itemId`, `savedBack`), matching the library rather than the viewer's wire format. See [Naming](#naming).

Under `--json`, stdout carries exactly one JSON document and nothing else, with progress and errors kept on stderr. A failure still emits a document (`{"ok": false, "error": "..."}`), so an empty stdout always means something went badly wrong. Streams are the exception, and emit one JSON object per line: `logs --json`, and `push --json --tail` given no duration to stop at, which prints its document first and then streams.

## A session

`push` and `logs` each connect, do one thing and let go. `connect` stays, which is what the viewer expects. It publishes objects to whichever editor client is attached at the time, and it sends runtime output only to connections that are open at the moment a script speaks. Nothing is buffered, and the protocol has no way to ask for what it already sent, so a line spoken with nothing connected is gone.

Most of what a script says follows a touch, a listen, a timer or an HTTP response rather than anything you typed. A session still holding the connection hears all of it, and lets you press "Explore in IDE" on a new object whenever you like. A command that exited hears nothing and publishes nothing.

A session is one viewer connection, watching the built outputs your `slua.json` names, pushing when they change, and printing what your scripts say for as long as you keep it open.

```bash
slua-viewer connect --exec "bun run build:watch"
```

That is one terminal for the whole loop. `--exec` runs your build inside the session and prefixes its output, so there is no second window to keep an eye on. The scaffolds wire this up as `bun run dev`.

Watching is a behaviour of the session, not the point of it. `--no-watch` still holds the connection, still streams output and still serves the control socket, which is what an agent driving pushes explicitly wants.

Every push restarts the script and costs an asset upload through the simulator, so the watcher is built to decide when a burst of edits has **finished** rather than to react quickly:

| Guard             | What it does                                                            |
| ----------------- | ----------------------------------------------------------------------- |
| Debounce, 3s      | A burst of saves becomes one push. `--debounce <ms>` to tune            |
| Trailing edge     | Fires after the quiet, not on the first write. `--edge leading` to swap |
| Coalescing        | Changes during a push collapse into one follow-up, never a queue        |
| Minimum interval  | The same item is not pushed again within a few seconds, and says so     |
| Identical content | A rebuild that changed nothing does not restart a running script        |

A failed compile is reported loudly, and says what it left behind: the save succeeded, so the item now holds source that never compiled, while the previously compiled version keeps running.

### Session state

`connect` keeps `.slua/` beside your `slua.json`:

| File                 | What it is                                                          |
| -------------------- | ------------------------------------------------------------------- |
| `.slua/session.json` | pid, socket path, viewer port, CLI version. Removed on a clean exit |
| `.slua/logs.jsonl`   | Every runtime record and push result, one JSON object per line      |

The log survives the session crashing, which is exactly when you want to read it. It rotates at 5MB, keeping one previous file. Add `.slua/` to your `.gitignore`; the scaffolds already do.

While a session is running, the other commands go through it rather than opening their own connection, so they share its viewer connection and its cursor. `--direct` opts out.

## Driving it from an agent

Three tiers, in order of how little integration they need.

**Read the file.** `tail -n 100 .slua/logs.jsonl` needs nothing from us at all, and works after the session has gone.

**Run the CLI.** `status`, `wait` and `logs --since` are thin wrappers over the session, and everything speaks `--json`:

```bash
slua-viewer status --json
slua-viewer wait --since 412 --for 20s      # blocks until a push newer than 412 settles
slua-viewer logs --since 5m                  # from the session, or from its log if it has gone
```

`wait` takes the cursor you last saw, not "the current push". Asking to wait for the in-flight push is only correct if one is already in flight, and it usually is not, so that form would happily hand back the **previous** run's results as though they were current.

**Speak MCP.** `slua-viewer mcp` is a stdio MCP server over the same socket, with `slua_status`, `slua_push`, `slua_wait` and `slua_logs`. `slua_push` pushes and waits in one call, returning the compile result per target and the output the restarted script produced.

```jsonc
{
  "mcpServers": {
    "slua": { "command": "slua-viewer", "args": ["mcp"], "cwd": "/path/to/project" },
  },
}
```

It needs a session running; with none it says so rather than guessing.

### The control socket

The session listens on a unix socket (a named pipe on Windows) at mode 0600, in your temp directory, keyed by a hash of the project root. The path is recorded in `.slua/session.json`.

It speaks the viewer's own JSON-RPC, so `ViewerClient` connects to a session exactly as it connects to the viewer, and only the `control.*` namespace is new. Viewer calls are forwarded upstream and viewer notifications are broadcast back down.

> Any local process that can reach that socket can push scripts to your viewer. That is already true of port 9020 itself, which is why the socket is not a new exposure, but it is worth knowing.

## Publishing an object

Nothing can be read or written until the viewer publishes the object to the editor. Selecting it does not do that. Publishing is a button: **open the object's Build window, go to Content and press "Explore in IDE"**.

The catch is that the viewer only publishes when an editor client is already connected. Press it with nothing connected and it launches your external editor instead, which is why the button can look like it does nothing for this CLI. So connect first:

```bash
slua-viewer push dist/main.slua --wait
```

`--wait` holds the connection open and says what it is waiting for, then carries on the moment the object arrives. It applies to every command that resolves or lists a published object, including `objects --wait` to see what you just published and `logs --wait` to catch output from the start. `syntax`, `--help` and `--version` never touch a published object, so it does nothing there.

Addressing an object by UUID skips all of this: the viewer publishes it on demand, no button and no waiting. Names and description keys cannot be requested that way, since the viewer has no way to look them up.

The published inventory goes briefly stale right after a save. Sometimes the item, or the whole object, drops out of the listing; sometimes the listing is fine and the next save is rejected with `Item not found in prim inventory` even though the item is there and its id has not changed. Commands re-read the object and retry a few times before giving up, so a `push --all` that touches several scripts in a row is not derailed by it.

## Pairing projects with objects

An object's UUID changes every time it is taken and rezzed again, so pinning a project to one is a losing game. Names and descriptions survive that round trip, which makes a description key the durable way to pair.

`link main` stamps `slua:main` into the published object's description and records it in `slua.json`. From then on `push --all` finds the object by that key, however many times it has been rezzed.

There are three places a destination can come from, in order of precedence: **command line flags, then `slua.json`, then the source header**. The header is the default a script ships with; config retargets a build for a different environment without touching source.

### Source headers

A script can declare its own destination, so a small project needs no config at all:

```ts
/**
 * @slua-target desc:slua:my-project/Main
 * @slua-vm luau
 * @slua-save-back
 */
```

| Tag                            | Meaning                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| `@slua-target <object>/<item>` | Whole destination, `<object>/<link>/<item>` for a child prim |
| `@slua-object <selector>`      | Object only                                                  |
| `@slua-item <name>`            | Inventory item only                                          |
| `@slua-link <name>`            | Child prim only                                              |
| `@slua-vm <vm>`                | Compile target                                               |
| `@slua-save-back`              | Derez back into the source prim after a successful push      |

For a compiled bundle the tags are read from the source it came from, found through the source map. A hand-written script is its own source, so a `.lsl` or `.luau` file carries its header directly. Both comment syntaxes work (`//`, `/* */`, `--`, `--[[ ]]`), and tags are only honoured above the first line of code, so a `@slua-` string appearing later cannot silently retarget a deploy.

### slua.json

Config is optional. It is looked up from the working directory upwards, and relative paths resolve against the directory holding it.

```jsonc
{
  "targets": {
    "main": {
      "file": "dist/main.slua",
      "object": { "description": "slua:my-project" },
      "item": "Main",
      "saveBack": true,
    },
  },
}
```

| Field      | Meaning                                                        |
| ---------- | -------------------------------------------------------------- |
| `file`     | Built output to upload                                         |
| `object`   | `{ id }`, `{ name }` or `{ description }`, or the string form  |
| `item`     | Inventory item name                                            |
| `link`     | Child prim, when the item is not in the root                   |
| `vm`       | Compile target                                                 |
| `saveBack` | Derez back into the source prim after a successful push        |
| `entry`    | Source to read the header from, skipping the source map lookup |

`object` also accepts the string form: `"desc:slua:my-project"`, `"4f2b..."`, `"name:My Object"`.

Deploy one target with `--target main`, or all of them with `--all`.

## LSL

The viewer's protocol is bilingual, and so is this. `push`, `pull`, `reset`, `set-running` and `logs` all work on LSL scripts, `.lsl` compiles as `mono` unless you pass `--vm`, and LSL compile errors carry real column numbers, which the Luau compiler does not report. A mixed project, a few hand-written LSL scripts alongside your compiled SLua, works without special handling.

What this is not is an LSL toolchain: there is no preprocessor, no `#include` expansion, and no LSL linting. It deploys LSL, it does not build it.

## Saving back to a rezzer

`saveBack` derezzes the object into the prim it was rezzed from, which is how you update a rezzer's payload without the take-and-replace dance.

The viewer only offers this for an object rezzed out of another in-world prim's contents, and it decides that when the object is published. An object published by UUID alone reports `can_save_back: false`, and the push reports the save-back as failed.

An object sitting in your own inventory cannot be reached at all. It has to be rezzed.

## Mapping errors back to TypeScript

`push` looks for a source map beside the file it uploads (`dist/main.slua.map`) and translates the viewer's Lua line numbers back to your original source. Enable it with `"sourceMap": true` in your tsconfig. Without a map, errors are reported against the generated output instead.

Drained output maps the same way, so a `push` shows its script's first lines already annotated with the TypeScript they came from.

`logs` maps too. Runtime output reports positions in the generated Lua (`lua_script:5`), so each line is annotated with the TypeScript it came from, using the source maps of the targets in your `slua.json`. A viewer that names the item its output came from narrows that to the target deploying it, and labels each line `object/item`; without one, a line covered by more than one target's map is shown against every candidate, with its target name.

If you bundle with `@gwigz/tstl-bundle-flatten`, you need 1.2.0 or newer. Earlier versions rewrote the emitted Lua without updating the map, leaving it describing the unflattened bundle. Mapping is line accurate, not column accurate.

## Naming

The viewer's protocol is snake_case. Everything this package exposes is camelCase, converted once at the JSON-RPC boundary, so `object_id` on the wire is `objectId` in your code and in `--json` output.

Only field-shaped keys convert. Keys carrying data, an item named `Main` or an object named `Door Control`, pass through untouched.

## Library

```ts
import { readFile } from "node:fs/promises"
import {
  diagnosticsFrom,
  parseObjectRef,
  resolveItem,
  ViewerClient,
} from "@gwigz/slua-viewer-client"

const client = await ViewerClient.connect({ port: 9020 })

try {
  const target = await resolveItem(client, parseObjectRef("desc:slua:my-project/Main"))

  const result = await client.objectContentSave({
    primId: target.primId,
    itemId: target.itemId,
    content: await readFile("dist/main.slua", "utf8"),
    vm: "luau",
  })

  if (result.compiled === false) {
    console.error(diagnosticsFrom(result, "luau"))
  }
} finally {
  // An open socket keeps the process alive, so this happens either way.
  client.close()
}
```

The viewer drives the handshake, so this is a bidirectional peer rather than a plain client: it answers `session.handshake` (including the local-file auth challenge), `session.ping`, and any `editor.*` commands you register through the `commands` option.

Runtime output is only forwarded for published objects, so publish before you listen:

```ts
import { ensurePublished, ViewerClient } from "@gwigz/slua-viewer-client"

const client = await ViewerClient.connect()

await ensurePublished(client, { kind: "id", value: "4f2b0c1e-0000-0000-0000-000000000000" })

client.on("runtime.error", (event) => console.error(event.objectName, event.message))
```

Target resolution is exported too, so a custom deploy script can reuse the same precedence rules:

```ts
import { loadConfig, readHeaderTagsFor, resolveTarget } from "@gwigz/slua-viewer-client"

const config = await loadConfig()

const target = resolveTarget({
  name: "main",
  config: config?.targets.main,
  header: await readHeaderTagsFor("dist/main.slua"),
  configRoot: config?.root,
})
```

## Development

A mock viewer is included so the CLI can be exercised without a running viewer:

```bash
bun packages/viewer-client/scripts/mock-viewer.ts
bun packages/viewer-client/src/cli/index.ts objects --port 9020
```

Pushing a file containing `BREAK` makes the mock report a compile failure. Set `MOCK_SAVE_BACK=1` to make it accept save-back.
