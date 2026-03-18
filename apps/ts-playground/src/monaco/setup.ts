import "./env"
import { loader } from "@monaco-editor/react"
import * as monaco from "monaco-editor"
import sluaTypes from "@gwigz/slua-types/index.d.ts?raw"
import langExt from "@typescript-to-lua/language-extensions/index.d.ts?raw"
import { tsLibs } from "./ts-libs"

loader.config({ monaco })

loader.init().then((editor) => {
  // Inject SLua type definitions for autocomplete
  editor.languages.typescript.typescriptDefaults.addExtraLib(langExt, "ts:language-extensions.d.ts")
  editor.languages.typescript.typescriptDefaults.addExtraLib(sluaTypes, "ts:slua.d.ts")

  // Match the compiler options we use in the TSTL worker.
  // noLib: true prevents loading lib.dom.d.ts which declares browser globals
  // (origin, name, location, etc.) that conflict with SLua user code.
  editor.languages.typescript.typescriptDefaults.setCompilerOptions({
    strict: true,
    noImplicitAny: true,
    noLib: true,
    target: editor.languages.typescript.ScriptTarget.ES5,
    moduleResolution: editor.languages.typescript.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    noEmit: true,
  })

  // Provide lib files manually so built-in types (string, number, Array, etc.) work
  for (const [name, content] of tsLibs) {
    editor.languages.typescript.typescriptDefaults.addExtraLib(content, `ts:${name}`)
  }
})
