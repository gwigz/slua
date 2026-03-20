import "./env"
import { loader } from "@monaco-editor/react"
import * as monaco from "monaco-editor"
import sluaTypes from "@gwigz/slua-types/index.d.ts?raw"
import langExt from "@typescript-to-lua/language-extensions/index.d.ts?raw"
import { tsLibs } from "./ts-libs"

loader.config({ monaco })

// Vitesse Dark theme
monaco.editor.defineTheme("vitesse-dark", {
  base: "vs-dark",
  inherit: false,
  colors: {
    "editor.background": "#121212",
    "editor.foreground": "#dbd7ca",
    "editor.lineHighlightBackground": "#181818",
    "editor.selectionBackground": "#eeeeee18",
    "editor.inactiveSelectionBackground": "#eeeeee10",
    "editor.findMatchBackground": "#e6cc7722",
    "editor.findMatchHighlightBackground": "#e6cc7744",
    "editorLineNumber.foreground": "#dedcd550",
    "editorLineNumber.activeForeground": "#bfbaaa",
    "editorIndentGuide.background": "#ffffff15",
    "editorIndentGuide.activeBackground": "#ffffff30",
    "editorBracketMatch.background": "#4d937520",
    "editorCursor.foreground": "#dbd7ca",
    "editorWhitespace.foreground": "#ffffff15",
    "editorWidget.background": "#121212",
    "editorWidget.border": "#191919",
    "editorSuggestWidget.background": "#121212",
    "editorSuggestWidget.border": "#191919",
    "editorSuggestWidget.selectedBackground": "#181818",
    "editorHoverWidget.background": "#121212",
    "editorHoverWidget.border": "#191919",
    "input.background": "#181818",
    "input.border": "#191919",
    focusBorder: "#00000000",
    "list.hoverBackground": "#181818",
    "list.activeSelectionBackground": "#181818",
    "scrollbarSlider.background": "#dedcd510",
    "scrollbarSlider.hoverBackground": "#dedcd550",
    "scrollbarSlider.activeBackground": "#dedcd550",
  },
  rules: [
    // fallback
    { token: "", foreground: "dbd7ca" },
    // comments
    { token: "comment", foreground: "758575" },
    // strings
    { token: "string", foreground: "c98a7d" },
    // numbers
    { token: "number", foreground: "4C9A91" },
    // keywords (if, else, for, return, etc.)
    { token: "keyword", foreground: "4d9375" },
    // storage keywords (let, const, var, function, class)
    { token: "keyword.declaration", foreground: "cb7676" },
    // operators
    { token: "operator", foreground: "cb7676" },
    // types
    { token: "type", foreground: "5DA994" },
    { token: "type.identifier", foreground: "5DA994" },
    // identifiers / variables
    { token: "identifier", foreground: "bd976a" },
    // delimiters / punctuation
    { token: "delimiter", foreground: "666666" },
    { token: "delimiter.bracket", foreground: "666666" },
    { token: "delimiter.parenthesis", foreground: "666666" },
    { token: "delimiter.square", foreground: "666666" },
    { token: "delimiter.angle", foreground: "666666" },
    // tags
    { token: "tag", foreground: "4d9375" },
    // regexp
    { token: "regexp", foreground: "c4704f" },
    // constants
    { token: "constant", foreground: "c99076" },

    // -- Lua-specific tokens --
    { token: "global.lua", foreground: "bd976a" },
    { token: "keyword.lua", foreground: "4d9375" },
    { token: "string.lua", foreground: "c98a7d" },
    { token: "number.lua", foreground: "4C9A91" },
    { token: "comment.lua", foreground: "758575" },
    { token: "delimiter.lua", foreground: "666666" },
    { token: "operator.lua", foreground: "cb7676" },
    { token: "identifier.lua", foreground: "bd976a" },
  ],
})

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
