import { describe, expect, it } from "bun:test"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import ts from "typescript"

/**
 * Typechecks the TypeScript examples in the README.
 *
 * Documented code drifts silently as the API changes, and a broken example is
 * worse than none: it costs a reader more to debug than to write from scratch.
 */
const PACKAGE_ROOT = dirname(import.meta.dir)
const README = join(PACKAGE_ROOT, "README.md")
const PACKAGE_NAME = "@gwigz/slua-viewer-client"

function extractExamples(markdown: string): string[] {
  return (
    [...markdown.matchAll(/```ts\n([\s\S]*?)```/g)]
      .map((match) => match[1])
      // Tag-only snippets are documentation of comment syntax, not code.
      .filter((code) => code.includes(PACKAGE_NAME))
  )
}

function check(code: string, index: number): string[] {
  // Point the example's import at the local sources.
  const fileName = join(import.meta.dir, `__readme-example-${index}.ts`)
  const source = code.replaceAll(`"${PACKAGE_NAME}"`, '"./index.js"')
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.ESNext, true)

  // Reuse the package's own tsconfig, so examples are held to the same
  // settings as the code they document.
  const configPath = join(PACKAGE_ROOT, "tsconfig.json")
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
  const { options } = ts.parseJsonConfigFileContent(configFile.config, ts.sys, PACKAGE_ROOT)

  options.noEmit = true

  const host = ts.createCompilerHost(options, true)
  const readFileFromHost = host.readFile.bind(host)
  const getSourceFile = host.getSourceFile.bind(host)

  // Type roots resolve from the current directory, and @types/node is
  // installed under the package rather than the workspace root.
  host.getCurrentDirectory = () => PACKAGE_ROOT
  host.readFile = (name) => (name === fileName ? source : readFileFromHost(name))
  host.fileExists = (name) => name === fileName || ts.sys.fileExists(name)
  host.getSourceFile = (name, ...rest) =>
    name === fileName ? sourceFile : getSourceFile(name, ...rest)

  const program = ts.createProgram([fileName], options, host)

  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.file?.fileName === fileName)
    .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, " "))
}

describe("README examples", () => {
  const examples = extractExamples(readFileSync(README, "utf8"))

  it("has examples to check", () => {
    expect(examples.length).toBeGreaterThan(0)
  })

  for (const [index, code] of examples.entries()) {
    it(`example ${index + 1} typechecks`, () => {
      expect(check(code, index)).toEqual([])
    })
  }
})
