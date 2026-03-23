import * as ts from "typescript"

/**
 * PascalCase class names that map to lowercase Lua globals.
 * `new Vector(...)` is handled by @customConstructor, but static access
 * like `Vector.zero` emits `Vector.zero` in Lua -- which doesn't exist.
 * The PropertyAccessExpression visitor rewrites the Lua identifier to lowercase.
 */
export const PASCAL_TO_LOWER: Record<string, string> = {
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
export const TSTL_KEYWORD_FIXUPS: Record<string, string> = {
  ____bit32: "bit32",
}

export const BINARY_BITWISE_OPS: Record<number, string> = {
  [ts.SyntaxKind.AmpersandToken]: "band",
  [ts.SyntaxKind.BarToken]: "bor",
  [ts.SyntaxKind.CaretToken]: "bxor",
  [ts.SyntaxKind.LessThanLessThanToken]: "lshift",
  [ts.SyntaxKind.GreaterThanGreaterThanToken]: "arshift",
  [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken]: "rshift",
}

/**
 * Compound bitwise assignment tokens (`&=`, `|=`, etc.) map to the same
 * `bit32.*` functions as their non-compound counterparts.  We handle
 * these at the TypeScript AST level rather than patching the Lua AST,
 * because TSTL's desugaring loses the distinction between `>>=`
 * (arshift) and `>>>=` (rshift) -- both lower to the same Lua operator.
 */
export const COMPOUND_BITWISE_OPS: Record<number, string> = {
  [ts.SyntaxKind.AmpersandEqualsToken]: "band",
  [ts.SyntaxKind.BarEqualsToken]: "bor",
  [ts.SyntaxKind.CaretEqualsToken]: "bxor",
  [ts.SyntaxKind.LessThanLessThanEqualsToken]: "lshift",
  [ts.SyntaxKind.GreaterThanGreaterThanEqualsToken]: "arshift",
  [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken]: "rshift",
}

export const EQUALITY_OPS = new Set([
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
])
