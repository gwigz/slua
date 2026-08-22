#!/usr/bin/env node
import { createRequire } from "node:module"
import pc from "picocolors"
import {
  ConnectionClosedError,
  HandshakeError,
  RpcError,
  RpcErrorCode,
  RpcTimeoutError,
  ViewerUnavailableError,
} from "../protocol/errors.js"
import { CliUsageError, helpText, parseCliArgs } from "./args.js"
import { connectCommand } from "./commands/connect.js"
import { statusCommand, waitCommand } from "./commands/control.js"
import { mcpCommand } from "./commands/mcp.js"
import { linkCommand } from "./commands/link.js"
import { objectsCommand } from "./commands/objects.js"
import { logsCommand } from "./commands/logs.js"
import { pullCommand } from "./commands/pull.js"
import { pushCommand } from "./commands/push.js"
import { resetCommand, setRunningCommand } from "./commands/script.js"
import { syntaxCommand } from "./commands/syntax.js"
import { publishOptions, withClient, withControl } from "./connect.js"
import { createReporter } from "./output.js"

/** Whether stdout owes a JSON document, even when nothing parses. */
let wantsJson = false

async function main(): Promise<number> {
  // Read straight from argv first: a usage error still owes a --json consumer
  // its document, and the parser rejects before it can report the flag.
  wantsJson = process.argv.includes("--json")

  const { global, command } = parseCliArgs(process.argv.slice(2))
  const reporter = createReporter(global.json)

  wantsJson = global.json

  const publish = publishOptions(global, reporter)

  switch (command.name) {
    case "help":
      process.stdout.write(helpText())

      return 0

    case "version":
      process.stdout.write(`${createRequire(import.meta.url)("../../package.json").version}\n`)

      return 0

    case "logs":
      return await logsCommand(global, command, reporter, publish)

    case "connect":
      return await connectCommand(global, command, reporter, publish)

    case "mcp":
      return await mcpCommand(global, reporter)

    case "status":
      return await withControl(global, reporter, (control) => statusCommand(control, reporter))

    case "wait":
      return await withControl(global, reporter, (control) =>
        waitCommand(control, command, reporter),
      )

    case "objects":
      return await withClient(global, reporter, (client) =>
        objectsCommand(client, reporter, publish),
      )

    case "pull":
      return await withClient(global, reporter, (client) =>
        pullCommand(client, command, reporter, publish),
      )

    case "push":
      return await withClient(global, reporter, (client) =>
        pushCommand(client, command, reporter, publish),
      )

    case "reset":
      return await withClient(global, reporter, (client) =>
        resetCommand(client, command, reporter, publish),
      )

    case "set-running":
      return await withClient(global, reporter, (client) =>
        setRunningCommand(client, command, reporter, publish),
      )

    case "syntax":
      return await withClient(global, reporter, (client) =>
        syntaxCommand(client, command, reporter),
      )

    case "link":
      return await withClient(global, reporter, (client) =>
        linkCommand(client, command, reporter, publish),
      )
  }
}

/** Turns the library's error types into advice rather than a stack trace. */
function explain(error: unknown): string {
  if (error instanceof HandshakeError) {
    return `${error.message}\n${pc.dim("the viewer must be running with external script editing enabled")}`
  }

  if (error instanceof ConnectionClosedError) {
    return "the viewer closed the connection"
  }

  if (error instanceof RpcTimeoutError) {
    return error.message
  }

  if (error instanceof RpcError) {
    // Compile errors trip a std::stoi in the viewer's diagnostics parser,
    // which throws before returning the line and message.
    if (error.code === RpcErrorCode.InternalError && /\bstoi\b/i.test(error.message)) {
      return `the viewer could not read the compiler output (${error.message})\n${pc.dim(
        "your source was saved but not compiled; this is a viewer bug, not a fault in your script",
      )}`
    }

    return `${error.message} (${error.code})`
  }

  if (error instanceof ViewerUnavailableError) {
    return `${error.message}\n${pc.dim(
      "check the viewer is running, and that ExternalWebsocketSyncEnable is on",
    )}`
  }

  return error instanceof Error ? error.message : String(error)
}

main()
  .then((code) => {
    process.exitCode = code
  })
  .catch((error) => {
    process.stderr.write(`${pc.red("error:")} ${explain(error)}\n`)

    // A --json consumer needs a document even when the command fails, or it
    // sees empty stdout and cannot tell success from silence.
    if (wantsJson) {
      process.stdout.write(
        `${JSON.stringify(
          { ok: false, error: error instanceof Error ? error.message : String(error) },
          null,
          2,
        )}\n`,
      )
    }

    if (error instanceof CliUsageError) {
      process.stderr.write(`\n${helpText()}`)
    }

    process.exitCode = 1
  })
