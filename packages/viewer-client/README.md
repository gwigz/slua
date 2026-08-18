# `@gwigz/slua-viewer-client`

Push SLua to the Second Life viewer's external script editor, without touching the viewer UI.

The viewer ships a JSON-RPC 2.0 WebSocket server on `localhost:9020` for external script editing. This is a typed client for that protocol, plus a CLI so a build can deploy itself:

```bash
bun run build && bunx @gwigz/slua-viewer-client push dist/main.slua
```

Compile errors come back with the file and line of your **TypeScript** source, given a source map beside the pushed file, and against the generated output without one. A failed compile exits non-zero.

## Requirements

A viewer with external script editing enabled (`ExternalWebsocketSyncEnable`). The object you are targeting must be published to the editor, which happens when you select it in the viewer, or on demand when you address it by UUID.

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
| `link <name>`                         | Pair a target with the selected object       |
| `reset <object>/<item>`               | Reset a script                               |
| `set-running on\|off <object>/<item>` | Start or stop a script                       |
| `logs`                                | Stream runtime output from published objects |
| `syntax [defs.lsl\|defs.lua]`         | Dump language definitions                    |

Examples below use the `slua-viewer` bin name, which resolves inside a package script or after a devDependency install. Prefix them with `bunx @gwigz/slua-viewer-client` to run them straight from a shell.

### Addressing

Targets are `<object>/<item>`, or `<object>/<link>/<item>` for an item in a child prim. The `--object`, `--link` and `--item` flags are equivalent.

The object segment takes a UUID, a name, or an explicit `id:` / `name:` / `desc:` prefix. Items match with or without the display extension, so `Main` and `Main.luau` are the same item. Child prims match on link name, `Name (2)` when siblings share a name, link number, or UUID.

```bash
slua-viewer push dist/main.slua 4f2b0c1e-.../Main
slua-viewer push dist/main.slua "desc:slua:my-project/Main"
slua-viewer push dist/main.slua "My Rezzer/Panel/Main"
```

### Options

| Flag                  | Applies to     | Meaning                                              |
| --------------------- | -------------- | ---------------------------------------------------- |
| `--object <id\|name>` | most           | Target object, same grammar as the object segment    |
| `--item <id\|name>`   | most           | Target inventory item                                |
| `--link <id\|name>`   | most           | Child prim within the linkset                        |
| `--vm <vm>`           | `push`         | Compile target: `luau`, `mono`, `lsl2`               |
| `--target <name>`     | `push`         | Deploy a named target from `slua.json`               |
| `--all`               | `push`         | Deploy every target in `slua.json`                   |
| `--save-back`         | `push`         | Derez back into the source prim after a good compile |
| `--file <path>`       | `push`, `link` | File to push, or to record when linking              |
| `--key <key>`         | `link`         | Description key to pair on, default `slua:<name>`    |
| `-f`, `--follow`      | `logs`         | Keep streaming, reconnecting if the viewer restarts  |
| `--port <port>`       | all            | Viewer websocket port, default `9020`                |
| `--timeout <ms>`      | all            | Request timeout                                      |
| `--json`              | all            | Machine-readable output on stdout                    |

Keys in `--json` output are camelCase (`objectId`, `primId`, `itemId`, `savedBack`), matching the library rather than the viewer's wire format. See [Naming](#naming).

Under `--json`, stdout carries exactly one JSON document and nothing else, with progress and errors kept on stderr. A failure still emits a document (`{"ok": false, "error": "..."}`), so an empty stdout always means something went badly wrong. `logs --json` is the exception: it emits one JSON object per line, since it is a stream.

## Pairing projects with objects

An object's UUID changes every time it is taken and rezzed again, so pinning a project to one is a losing game. Names and descriptions survive that round trip, which makes a description key the durable way to pair.

`link main` stamps `slua:main` into the selected object's description and records it in `slua.json`. From then on `push --all` finds the object by that key, however many times it has been rezzed.

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

The viewer only offers this for an object rezzed out of another in-world prim's contents, and it decides that from the selection at the moment the object is published. An object published by UUID alone, with nothing selected, reports `can_save_back: false` and the push reports the save-back as failed.

An object sitting in your own inventory cannot be reached at all. It has to be rezzed.

## Mapping errors back to TypeScript

`push` looks for a source map beside the file it uploads (`dist/main.slua.map`) and translates the viewer's Lua line numbers back to your original source. Enable it with `"sourceMap": true` in your tsconfig. Without a map, errors are reported against the generated output instead.

If you bundle with `@gwigz/tstl-bundle-flatten`, you need 1.2.0 or newer. Earlier versions rewrote the emitted Lua without updating the map, leaving it describing the unflattened bundle. Mapping is line accurate, not column accurate.

## Naming

The viewer's protocol is snake_case. Everything this package exposes is camelCase, converted once at the JSON-RPC boundary, so `object_id` on the wire is `objectId` in your code and in `--json` output.

Only field-shaped keys convert. Keys carrying data, an item named `Main` or an object named `Door Control`, pass through untouched.

## Library

```ts
import { readFile } from "node:fs/promises"
import {
  parseCompileErrors,
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
    console.error(parseCompileErrors(result.errors, "luau"))
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
