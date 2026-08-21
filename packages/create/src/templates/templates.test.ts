import { describe, expect, it } from "bun:test"
import type { Extras, ProjectOptions } from "../prompts"
import { generateSingleTemplate } from "./single"
import { generateMultiTemplate } from "./multi"

const NO_EXTRAS: Extras = {
  jsx: false,
  config: false,
  utilities: false,
  yield: false,
  stylua: false,
  linting: false,
  formatting: false,
}

function options(overrides: Partial<ProjectOptions> = {}): ProjectOptions {
  return {
    directory: "/tmp/test-project",
    projectName: "test-project",
    template: "single",
    extras: { ...NO_EXTRAS, ...overrides.extras },
    git: true,
    packageManager: "bun",
    ...overrides,
  }
}

describe("single template", () => {
  it("has build and dev scripts", () => {
    const pkg = JSON.parse(generateSingleTemplate(options())["package.json"])

    expect(pkg.scripts.build).toBe("tstl -p tsconfig.json")

    // dev is the viewer session, which runs the watch build inside it, so
    // there is one command rather than two terminals and an explanation.
    expect(pkg.scripts.dev).toBe('slua-viewer connect --exec "tstl -p tsconfig.json --watch"')
    expect(pkg.scripts["build:watch"]).toBe("tstl -p tsconfig.json --watch")
    expect(pkg.devDependencies["@gwigz/slua-viewer-client"]).toBeDefined()
  })

  it("gives the multi template the same session entry point", () => {
    const pkg = JSON.parse(generateMultiTemplate(options({ template: "multi" }))["package.json"])

    expect(pkg.scripts.dev).toBe('slua-viewer connect --exec "bun build.ts --watch"')
    expect(pkg.scripts["build:watch"]).toBe("bun build.ts --watch")
    expect(pkg.devDependencies["@gwigz/slua-viewer-client"]).toBeDefined()
  })

  it("ignores the session state directory", () => {
    expect(generateSingleTemplate(options())[".gitignore"]).toContain(".slua/")
    expect(generateMultiTemplate(options({ template: "multi" }))[".gitignore"]).toContain(".slua/")
  })

  it("bundles with require-minimal and the flatten plugin", () => {
    const tsconfig = JSON.parse(generateSingleTemplate(options())["tsconfig.json"])

    expect(tsconfig.tstl.luaLibImport).toBe("require-minimal")
    expect(tsconfig.tstl.luaBundle).toBe("new-script.slua")

    const pluginNames = tsconfig.tstl.luaPlugins.map((p: { name: string }) => p.name)

    expect(pluginNames).toContain("@gwigz/slua-tstl-plugin")
    expect(pluginNames).toContain("@gwigz/tstl-bundle-flatten")
  })

  it("emits source maps, so push reports errors against the TypeScript", () => {
    for (const files of [
      generateSingleTemplate(options()),
      generateMultiTemplate(options({ template: "multi" })),
    ]) {
      expect(JSON.parse(files["tsconfig.json"]).compilerOptions.sourceMap).toBe(true)
    }
  })

  it("vendors the utilities module when selected", () => {
    const files = generateSingleTemplate(options({ extras: { ...NO_EXTRAS, utilities: true } }))

    expect(Object.keys(files)).toContain("modules/utilities/index.ts")
  })

  it("does not vendor modules by default", () => {
    const files = generateSingleTemplate(options())

    expect(Object.keys(files).some((f) => f.startsWith("modules/"))).toBe(false)
  })
})

describe("multi template", () => {
  it("has build and dev scripts", () => {
    const files = generateMultiTemplate(options({ template: "multi" }))
    const pkg = JSON.parse(files["package.json"])

    expect(pkg.scripts.build).toBeDefined()
    expect(pkg.scripts.dev).toContain("--watch")
  })

  it("generates a build.ts using require-minimal", () => {
    const files = generateMultiTemplate(options({ template: "multi" }))

    expect(files["build.ts"]).toContain("LuaLibImportKind.RequireMinimal")
    expect(files["build.ts"]).toContain("@gwigz/tstl-bundle-flatten")
  })

  it("vendors the utilities module when selected", () => {
    const files = generateMultiTemplate(
      options({ template: "multi", extras: { ...NO_EXTRAS, utilities: true } }),
    )

    expect(Object.keys(files)).toContain("src/modules/utilities/index.ts")
  })
})
