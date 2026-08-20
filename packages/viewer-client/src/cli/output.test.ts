import { describe, expect, it, spyOn } from "bun:test"
import { createReporter } from "./output"

function capture(json: boolean, run: (reporter: ReturnType<typeof createReporter>) => void) {
  const out: string[] = []
  const err: string[] = []
  const stdout = spyOn(process.stdout, "write").mockImplementation(((text: string) => {
    out.push(text)

    return true
  }) as never)
  const stderr = spyOn(process.stderr, "write").mockImplementation(((text: string) => {
    err.push(text)

    return true
  }) as never)

  try {
    run(createReporter(json))
  } finally {
    stdout.mockRestore()
    stderr.mockRestore()
  }

  return { out: out.join(""), err: err.join("") }
}

describe("createReporter", () => {
  it("puts only the JSON document on stdout in JSON mode", () => {
    const { out, err } = capture(true, (reporter) => {
      reporter.line("human readable")
      reporter.note("progress")
      reporter.data({ ok: true })
    })

    expect(JSON.parse(out)).toEqual({ ok: true })
    expect(out).not.toContain("human readable")
    expect(out).not.toContain("progress")
    expect(err).toContain("progress")
  })

  it("writes human output and no JSON otherwise", () => {
    const { out } = capture(false, (reporter) => {
      reporter.line("human readable")
      reporter.data({ ok: true })
    })

    expect(out).toBe("human readable\n")
  })

  it("always sends errors to stderr, so piped output stays clean", () => {
    const { out, err } = capture(true, (reporter) => reporter.error("boom"))

    expect(out).toBe("")
    expect(err).toContain("boom")
  })
})
