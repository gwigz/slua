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

const plugin: tstl.Plugin = {
  visitors: {
    [ts.SyntaxKind.PropertyAccessExpression]: (node: ts.PropertyAccessExpression, context) => {
      const result = context.superTransformExpression(node)

      // Rewrite PascalCase namespace identifiers to lowercase in the Lua AST.
      // e.g. Vector.zero → TableIndexExpression(Identifier("Vector"), ...)
      //   becomes → TableIndexExpression(Identifier("vector"), ...)
      if (tstl.isTableIndexExpression(result) && tstl.isIdentifier(result.table)) {
        const lower = PASCAL_TO_LOWER[result.table.text]

        if (lower) {
          result.table.text = lower
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
