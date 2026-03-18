import * as ts from "typescript"
import * as tstl from "typescript-to-lua"

/**
 * PascalCase class names that map to lowercase Lua globals.
 * `new Vector(...)` is handled by @customConstructor, but static access
 * like `Vector.zero` emits `Vector.zero` in Lua -- which doesn't exist.
 * The PropertyAccessExpression visitor rewrites the Lua identifier to lowercase.
 */
const PASCAL_TO_LOWER: Record<string, string> = {
  Vector: "vector",
  Quaternion: "quaternion",
  UUID: "uuid",
}

/**
 * TSTL treats "bit32" as a Lua keyword and renames it to "____bit32" in output.
 * This is incorrect for Luau where bit32 is a valid global library.
 * The visitor rewrites the mangled name back; the diagnostic is suppressed
 * separately in consumers (e.g. the playground transpiler worker).
 */
const TSTL_KEYWORD_FIXUPS: Record<string, string> = {
  ____bit32: "bit32",
}

const plugin: tstl.Plugin = {
  visitors: {
    [ts.SyntaxKind.PropertyAccessExpression]: (node: ts.PropertyAccessExpression, context) => {
      const result = context.superTransformExpression(node)

      // Rewrite identifiers in the Lua AST (PascalCase → lowercase, TSTL keyword fixups).
      if (tstl.isTableIndexExpression(result) && tstl.isIdentifier(result.table)) {
        const replacement = PASCAL_TO_LOWER[result.table.text] ?? TSTL_KEYWORD_FIXUPS[result.table.text]

        if (replacement) {
          result.table.text = replacement
        }
      }

      return result
    },
  },

  beforeTransform(_program, options) {
    const diagnostics: ts.Diagnostic[] = []

    if (options.luaTarget !== tstl.LuaTarget.Luau) {
      diagnostics.push({
        file: undefined,
        start: undefined,
        length: undefined,
        messageText:
          '@gwigz/slua-tstl-plugin requires luaTarget to be "Luau", set "luaTarget": "Luau" in tsconfig.json',
        category: ts.DiagnosticCategory.Error,
        code: 90000,
        source: "@gwigz/slua-tstl-plugin",
      })
    }

    if (
      options.luaLibImport !== undefined &&
      ![tstl.LuaLibImportKind.None, tstl.LuaLibImportKind.Inline].includes(options.luaLibImport)
    ) {
      diagnostics.push({
        file: undefined,
        start: undefined,
        length: undefined,
        messageText: '@gwigz/slua-tstl-plugin requires luaLibImport to be "none" or "inline"',
        category: ts.DiagnosticCategory.Warning,
        code: 90002,
        source: "@gwigz/slua-tstl-plugin",
      })
    }

    return diagnostics
  },
}

export default plugin
