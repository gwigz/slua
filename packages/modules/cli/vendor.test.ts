import { describe, it, expect } from "bun:test"
import { existsSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"
import { MODULES, MODULE_NAMES, readModuleFiles } from "./vendor"

const SRC_DIR = resolve(import.meta.dir, "../src")

describe("vendor manifest", () => {
  it("lists only files that exist on disk", () => {
    for (const name of MODULE_NAMES) {
      const entry = MODULES[name]

      for (const path of [...entry.files, ...entry.internal]) {
        expect(existsSync(join(SRC_DIR, path)), `${name}: ${path}`).toBe(true)
      }
    }
  })

  it("covers every non-test source file", () => {
    const onDisk = readdirSync(SRC_DIR, { recursive: true })
      .map(String)
      .filter((path) => path.endsWith(".ts") && !path.endsWith(".test.ts"))
      .toSorted()

    const manifest = [
      ...new Set(
        MODULE_NAMES.flatMap((name) => [...MODULES[name].files, ...MODULES[name].internal]),
      ),
    ].toSorted()

    expect(manifest).toEqual(onDisk)
  })

  it("rewrites package specifiers to vendored paths", () => {
    for (const name of MODULE_NAMES) {
      for (const file of readModuleFiles(name)) {
        expect(file.content).not.toContain("@gwigz/slua-modules/")
      }
    }
  })

  it("declares flags files that match defaultDefine", () => {
    for (const name of MODULE_NAMES) {
      const entry = MODULES[name]
      const hasFlags = Object.keys(entry.defaultDefine).length > 0

      expect(Boolean(entry.flagsFile), name).toBe(hasFlags)

      if (entry.flagsFile) {
        const flags = readModuleFiles(name).find((file) => file.path === entry.flagsFile)

        expect(flags).toBeDefined()

        for (const flag of Object.keys(entry.defaultDefine)) {
          expect(flags?.content).toContain(`declare const ${flag}: boolean`)
        }
      }
    }
  })
})
