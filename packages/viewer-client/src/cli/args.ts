import { parseArgs } from "node:util"
import {
  type ObjectRef,
  parseObjectRef,
  parseObjectSelector,
  PUBLISH_WAIT_MS,
} from "../addressing.js"
import { DEFAULT_PORT } from "../protocol/peer.js"
import type { ScriptVM, SyntaxKind } from "../protocol/types.js"

export class CliUsageError extends Error {
  constructor(message: string) {
    super(message)

    this.name = "CliUsageError"
  }
}

export interface GlobalFlags {
  port: number
  json: boolean
  timeoutMs?: number
  /** How long to hold the connection open waiting for the viewer to publish. */
  waitMs?: number
}

export type Command =
  | { name: "help" }
  | { name: "version" }
  | { name: "objects" }
  | { name: "pull"; ref: ObjectRef; out?: string }
  | {
      name: "push"
      file?: string
      ref?: ObjectRef
      vm?: ScriptVM
      /** Deploy a named target from slua.json instead of a file path. */
      target?: string
      all: boolean
      saveBack?: boolean
    }
  | { name: "link"; target: string; object?: string; item?: string; file?: string; key?: string }
  | { name: "reset"; ref: ObjectRef }
  | { name: "set-running"; ref: ObjectRef; running: boolean }
  | { name: "logs"; object?: string; follow: boolean; targets: boolean }
  | { name: "syntax"; kind?: SyntaxKind }

export interface CliArgs {
  global: GlobalFlags
  command: Command
}

const VM_VALUES: ScriptVM[] = ["luau", "mono", "lsl2"]
const SYNTAX_KINDS: SyntaxKind[] = ["defs.lsl", "defs.lua"]

const OPTIONS = {
  port: { type: "string" },
  json: { type: "boolean" },
  timeout: { type: "string" },
  object: { type: "string" },
  item: { type: "string" },
  link: { type: "string" },
  vm: { type: "string" },
  target: { type: "string" },
  all: { type: "boolean" },
  "save-back": { type: "boolean" },
  file: { type: "string" },
  key: { type: "string" },
  follow: { type: "boolean", short: "f" },
  targets: { type: "boolean" },
  wait: { type: "boolean" },
  help: { type: "boolean", short: "h" },
  version: { type: "boolean", short: "v" },
} as const

function rawParse(argv: string[]) {
  try {
    return parseArgs({ args: argv, options: OPTIONS, allowPositionals: true })
  } catch (error) {
    throw new CliUsageError(error instanceof Error ? error.message : String(error))
  }
}

function integer(raw: string | undefined, label: string): number | undefined {
  if (raw === undefined) return undefined

  const value = Number(raw)

  if (!Number.isInteger(value) || value <= 0) {
    throw new CliUsageError(`--${label} must be a positive integer, got "${raw}"`)
  }

  return value
}

/**
 * Resolves the target item from either a positional `<object>/<item>` ref or
 * the `--object` / `--item` flag pair.
 */
function optionalTargetRef(
  positional: string | undefined,
  values: { object?: string; item?: string; link?: string },
): ObjectRef | undefined {
  if (positional !== undefined) return parseObjectRef(positional)

  if (values.object === undefined && values.item === undefined) return undefined

  if (values.object === undefined || values.item === undefined) {
    throw new CliUsageError("--object and --item must be given together")
  }

  return { object: parseObjectSelector(values.object), link: values.link, item: values.item }
}

function targetRef(
  positional: string | undefined,
  values: { object?: string; item?: string; link?: string },
): ObjectRef {
  const ref = optionalTargetRef(positional, values)

  if (!ref) {
    throw new CliUsageError("specify the target as <object>/<item>, or with --object and --item")
  }

  return ref
}

export function parseCliArgs(argv: string[]): CliArgs {
  const { values, positionals } = rawParse(argv)

  const global: GlobalFlags = {
    port: integer(values.port, "port") ?? DEFAULT_PORT,
    json: values.json === true,
    timeoutMs: integer(values.timeout, "timeout"),
    waitMs: values.wait === true ? PUBLISH_WAIT_MS : undefined,
  }

  if (values.version === true) return { global, command: { name: "version" } }

  const [name, ...rest] = positionals

  if (values.help === true || name === undefined || name === "help") {
    return { global, command: { name: "help" } }
  }

  switch (name) {
    case "objects":
      return { global, command: { name: "objects" } }

    case "pull": {
      // With the target given by flags, the first positional is the output
      // path, not a ref, or `pull --object O --item I out.luau` would read
      // "out.luau" as the target.
      const flagged = values.object !== undefined && values.item !== undefined

      return {
        global,
        command: {
          name: "pull",
          ref: targetRef(flagged ? undefined : rest[0], values),
          out: flagged ? rest[0] : rest[1],
        },
      }
    }

    case "push": {
      if (values.vm !== undefined && !VM_VALUES.includes(values.vm as ScriptVM)) {
        throw new CliUsageError(`--vm must be one of ${VM_VALUES.join(", ")}`)
      }

      const file = rest[0] ?? values.file
      const all = values.all === true

      if (file === undefined && values.target === undefined && !all) {
        throw new CliUsageError(
          "push needs a file, --target <name>, or --all to deploy everything in slua.json",
        )
      }

      // One file cannot be what every target deploys, and taking it silently
      // would push the same build to all of them.
      if (all && file !== undefined) {
        throw new CliUsageError("--all deploys the file each target names, so it takes no file")
      }

      return {
        global,
        command: {
          name: "push",
          file,
          ref: optionalTargetRef(rest[1], values),
          vm: values.vm as ScriptVM | undefined,
          target: values.target,
          all,
          saveBack: values["save-back"],
        },
      }
    }

    case "link": {
      const target = rest[0] ?? values.target

      if (target === undefined) {
        throw new CliUsageError("link needs a target name, e.g. slua-viewer link main")
      }

      return {
        global,
        command: {
          name: "link",
          target,
          object: values.object,
          item: values.item,
          file: values.file,
          key: values.key,
        },
      }
    }

    case "reset":
      return { global, command: { name: "reset", ref: targetRef(rest[0], values) } }

    case "set-running": {
      const state = rest[0]

      if (state !== "on" && state !== "off") {
        throw new CliUsageError("set-running needs 'on' or 'off'")
      }

      return {
        global,
        command: { name: "set-running", ref: targetRef(rest[1], values), running: state === "on" },
      }
    }

    case "logs":
      return {
        global,
        command: {
          name: "logs",
          object: values.object,
          follow: values.follow === true,
          targets: values.targets === true,
        },
      }

    case "syntax": {
      const kind = rest[0]

      if (kind !== undefined && !SYNTAX_KINDS.includes(kind as SyntaxKind)) {
        throw new CliUsageError(`syntax kind must be one of ${SYNTAX_KINDS.join(", ")}`)
      }

      return { global, command: { name: "syntax", kind: kind as SyntaxKind | undefined } }
    }

    default:
      throw new CliUsageError(`unknown command "${name}"`)
  }
}

export function helpText(): string {
  return `slua-viewer - push SLua to the Second Life viewer's external script editor

Usage
  slua-viewer <command> [options]

Commands
  objects                          List objects the viewer has published
  pull <object>/<item> [out]       Fetch script or notecard content
  push [file] [object]/[item]      Upload and compile, non-zero exit on failure
  link <name>                      Pair a target with the published object
  reset <object>/<item>            Reset a script
  set-running on|off <object>/<item>
                                   Start or stop a script
  logs                             Stream runtime output from published objects
  syntax [defs.lsl|defs.lua]       Dump language definitions
  help                             Show this message

Target
  Pass <object>/<item>, or <object>/<link>/<item> for a child prim, or use
  --object, --item and --link. The object segment takes a UUID, a name, or
  desc:<key> to match the object's description.

  An object must be published first. Addressing it by UUID publishes it on
  demand; by name or description it has to come from the viewer, by opening
  the object's Build window, going to Content and pressing "Explore in IDE".
  That button only publishes while an editor client is already connected, so
  run the command with --wait and press it while the command waits.

  push can also take the target from a source header or slua.json, in which
  case the file alone is enough. Precedence is flags, then slua.json, then
  the header, so config retargets a build without touching the source.

    /**
     * @slua-target desc:slua:my-project/Main
     * @slua-vm luau
     * @slua-save-back
     */

  Object UUIDs change when an object is taken and rezzed again, so pair on a
  description key instead. "slua-viewer link <name>" stamps that key into the
  selected object and records it in slua.json.

Options
  --object <id|name>   Target object
  --item <id|name>     Target inventory item
  --link <id|name>     Target child prim within the linkset
  --vm <vm>            Compile target for push: ${VM_VALUES.join(", ")}
  --target <name>      Deploy a named target from slua.json
  --all                Deploy every target in slua.json
  --save-back          After pushing, derez back into the source prim
  --file <path>        File to push, or to record when linking
  --key <key>          Description key to pair on (default slua:<name>)
  -f, --follow         Keep streaming (logs)
  --targets            Only output from items your slua.json targets (logs)
  --wait               Wait for the viewer to publish, so "Explore in IDE"
                       has a client to publish to
  --port <port>        Viewer websocket port (default ${DEFAULT_PORT})
  --timeout <ms>       Request timeout
  --json               Emit JSON on stdout
  -h, --help           Show this message
  -v, --version        Print the version

Examples
  slua-viewer objects --json
  slua-viewer push dist/main.slua --object 4f2b... --item Main
  slua-viewer push dist/main.slua
  slua-viewer push dist/main.slua --wait
  slua-viewer link main
  slua-viewer push --all
  slua-viewer logs --object 4f2b... --follow
  slua-viewer logs --targets --follow
`
}
