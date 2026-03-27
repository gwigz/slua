/**
 * Monaco editor setup for the playground, defines theme, compiler options,
 * and extra type libraries. Exports a `beforeMount` handler for @monaco-editor/react.
 */
import type { BeforeMount } from "@monaco-editor/react"
import { sluaTypes, langExtensions, tsLibs } from "./generated/libs"

let initialized = false

export const beforeMount: BeforeMount = (monaco) => {
  if (initialized) return
  initialized = true

  // Vitesse Light theme
  monaco.editor.defineTheme("vitesse-light", {
    base: "vs",
    inherit: false,
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#393a34",
      "editor.lineHighlightBackground": "#f9f9f9",
      "editor.selectionBackground": "#b7d5fe80",
      "editor.inactiveSelectionBackground": "#b7d5fe40",
      "editor.findMatchBackground": "#b58900/22",
      "editor.findMatchHighlightBackground": "#b58900/44",
      "editorLineNumber.foreground": "#39393430",
      "editorLineNumber.activeForeground": "#393a34",
      "editorIndentGuide.background": "#00000015",
      "editorIndentGuide.activeBackground": "#00000030",
      "editorBracketMatch.background": "#4d937520",
      "editorCursor.foreground": "#393a34",
      "editorWhitespace.foreground": "#00000015",
      "editorWidget.background": "#ffffff",
      "editorWidget.border": "#e5e5e5",
      "editorSuggestWidget.background": "#ffffff",
      "editorSuggestWidget.border": "#e5e5e5",
      "editorSuggestWidget.selectedBackground": "#f1f1f1",
      "editorHoverWidget.background": "#ffffff",
      "editorHoverWidget.border": "#e5e5e5",
      "input.background": "#f9f9f9",
      "input.border": "#e5e5e5",
      focusBorder: "#00000000",
      "list.hoverBackground": "#f1f1f1",
      "list.activeSelectionBackground": "#f1f1f1",
      "scrollbarSlider.background": "#39393410",
      "scrollbarSlider.hoverBackground": "#39393440",
      "scrollbarSlider.activeBackground": "#39393440",
    },
    rules: [
      { token: "", foreground: "393a34" },
      { token: "comment", foreground: "a0ada0" },
      { token: "string", foreground: "b56959" },
      { token: "number", foreground: "296aa3" },
      { token: "keyword", foreground: "1e754f" },
      { token: "keyword.declaration", foreground: "ab5959" },
      { token: "operator", foreground: "ab5959" },
      { token: "type", foreground: "2e808f" },
      { token: "type.identifier", foreground: "2e808f" },
      { token: "identifier", foreground: "b07d48" },
      { token: "delimiter", foreground: "999999" },
      { token: "delimiter.bracket", foreground: "999999" },
      { token: "delimiter.parenthesis", foreground: "999999" },
      { token: "delimiter.square", foreground: "999999" },
      { token: "delimiter.angle", foreground: "999999" },
      { token: "tag", foreground: "1e754f" },
      { token: "regexp", foreground: "ab5959" },
      { token: "constant", foreground: "b07d48" },
      { token: "global.lua", foreground: "b07d48" },
      { token: "keyword.lua", foreground: "1e754f" },
      { token: "string.lua", foreground: "b56959" },
      { token: "number.lua", foreground: "296aa3" },
      { token: "comment.lua", foreground: "a0ada0" },
      { token: "delimiter.lua", foreground: "999999" },
      { token: "operator.lua", foreground: "ab5959" },
      { token: "identifier.lua", foreground: "b07d48" },
    ],
  })

  // Vitesse Dark theme (matches apps/web)
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

  // Compiler options: strict, noLib (we provide a curated subset)
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    strict: true,
    noImplicitAny: true,
    noLib: true,
    target: monaco.languages.typescript.ScriptTarget.ES5,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    noEmit: true,
  })

  // Add type libraries
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    langExtensions,
    "ts:language-extensions.d.ts",
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(sluaTypes, "ts:slua.d.ts")

  for (const [name, content] of tsLibs) {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(content, `ts:${name}`)
  }
}
