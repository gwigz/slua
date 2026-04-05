import { describe, test, expect } from "bun:test"
import { mkdtempSync, writeFileSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

const TYPES_PATH = join(import.meta.dir, "../../../packages/types/index.d.ts")

function checkCompiles(code: string): { success: boolean; output: string } {
  const dir = mkdtempSync(join(tmpdir(), "prim-params-"))
  const file = join(dir, "test.ts")

  // Write a tsconfig that skips lib check (the .d.ts has deps on buffer/TSTL
  // that aren't available here) but still type-checks our test code against it.
  writeFileSync(
    join(dir, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ESNext",
        module: "ESNext",
        strict: true,
        noEmit: true,
        skipLibCheck: true,
      },
      files: [file],
    }),
  )

  writeFileSync(file, `/// <reference path="${TYPES_PATH}" />\n${code}\n`)

  const result = Bun.spawnSync(["bunx", "tsc", "--project", join(dir, "tsconfig.json")], {
    cwd: dir,
    stderr: "pipe",
    stdout: "pipe",
  })

  const output = result.stdout.toString() + result.stderr.toString()
  rmSync(dir, { recursive: true, force: true })

  return { success: result.exitCode === 0, output }
}

describe("ParsePrimParams type validation", () => {
  test("VALID: PRIM_NAME with string arg", () => {
    const { success, output } = checkCompiles(
      `ll.SetLinkPrimitiveParamsFast(0, [PRIM_NAME, "hello"]);`,
    )
    if (!success) console.log(output)
    expect(success).toBe(true)
  })

  test("INVALID: PRIM_NAME with number arg (should fail)", () => {
    const { success } = checkCompiles(`ll.SetLinkPrimitiveParamsFast(0, [PRIM_NAME, 42]);`)
    expect(success).toBe(false)
  })

  test("VALID: multiple params [PRIM_NAME, string, PRIM_PHYSICS, boolean]", () => {
    const { success, output } = checkCompiles(
      `ll.SetLinkPrimitiveParamsFast(0, [PRIM_NAME, "test", PRIM_PHYSICS, true]);`,
    )
    if (!success) console.log(output)
    expect(success).toBe(true)
  })

  test("VALID: PRIM_TEXTURE with all 5 args", () => {
    const { success, output } = checkCompiles(
      `ll.SetLinkPrimitiveParamsFast(0, [PRIM_TEXTURE, 0, "texture-uuid", new Vector(1, 1, 0), new Vector(0, 0, 0), 0.0]);`,
    )
    if (!success) console.log(output)
    expect(success).toBe(true)
  })

  test("INVALID: PRIM_TEXTURE with missing args", () => {
    const { success } = checkCompiles(
      `ll.SetLinkPrimitiveParamsFast(0, [PRIM_TEXTURE, 0, "texture-uuid"]);`,
    )
    expect(success).toBe(false)
  })

  test("VALID: empty params []", () => {
    const { success, output } = checkCompiles(`ll.SetLinkPrimitiveParamsFast(0, []);`)
    if (!success) console.log(output)
    expect(success).toBe(true)
  })

  test("VALID: PRIM_NAME with string using as const", () => {
    const { success, output } = checkCompiles(
      `ll.SetLinkPrimitiveParamsFast(0, [PRIM_NAME, "hello"] as const);`,
    )
    if (!success) console.log(output)
    expect(success).toBe(true)
  })

  test("INVALID: PRIM_NAME with number using as const (should fail)", () => {
    const { success } = checkCompiles(`ll.SetLinkPrimitiveParamsFast(0, [PRIM_NAME, 42] as const);`)
    expect(success).toBe(false)
  })
})
