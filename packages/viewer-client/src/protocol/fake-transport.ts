import type { Transport } from "./jsonrpc.js"

/** An in-memory transport so tests can drive both directions without a socket. */
export class FakeTransport implements Transport {
  onmessage: ((data: string) => void) | null = null
  onclose: (() => void) | null = null
  onerror: ((error: Error) => void) | null = null

  readonly sent: string[] = []
  closed = false

  send(data: string): void {
    this.sent.push(data)
  }

  close(): void {
    if (this.closed) return

    this.closed = true
    this.onclose?.()
  }

  /** Delivers a message as though the viewer sent it. */
  receive(message: unknown): void {
    this.onmessage?.(typeof message === "string" ? message : JSON.stringify(message))
  }

  messages(): any[] {
    return this.sent.map((raw) => JSON.parse(raw))
  }

  /** The first message we sent for the given method, if any. */
  find(method: string): any | undefined {
    return this.messages().find((message) => message.method === method)
  }

  /** The response we sent for a given request id. */
  reply(id: number | string): any | undefined {
    return this.messages().find((message) => message.id === id && message.method === undefined)
  }
}

/** Resolves once `predicate` holds, polling the microtask queue. */
export async function waitFor(predicate: () => boolean, timeoutMs = 1_000): Promise<void> {
  const deadline = Date.now() + timeoutMs

  while (!predicate()) {
    if (Date.now() > deadline) throw new Error("timed out waiting for condition")

    await new Promise((resolve) => setTimeout(resolve, 1))
  }
}
