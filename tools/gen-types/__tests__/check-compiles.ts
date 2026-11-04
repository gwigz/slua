import { mkdtempSync, writeFileSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

const TYPES_PATH = join(import.meta.dir, "../../../packages/types/index.d.ts")

export function checkCompiles(code: string): { success: boolean; output: string } {
  const dir = mkdtempSync(join(tmpdir(), "check-compiles-"))
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
