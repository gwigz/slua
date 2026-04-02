import * as ts from "typescript"

/**
 * Remove exported declarations (and their unreferenced internal dependencies)
 * from TypeScript source, keeping only the declarations whose names are in
 * `survivingExports` plus anything they transitively reference.
 *
 * Returns the modified TypeScript source string.
 */
export function stripDeadExports(source: string, survivingExports: Set<string>): string {
  const sourceFile = ts.createSourceFile("module.ts", source, ts.ScriptTarget.Latest, true)

  // 1. Map declaration names to their nodes
  const declarations = new Map<string, ts.Node>()
  const stmtNames = new Map<ts.Node, string[]>()

  for (const stmt of sourceFile.statements) {
    const names = getDeclaredNames(stmt)
    stmtNames.set(stmt, names)
    for (const name of names) {
      declarations.set(name, stmt)
    }
  }

  // 2. Build reference graph: which declarations reference which others
  const references = new Map<string, Set<string>>()

  for (const [name, node] of declarations) {
    const refs = new Set<string>()
    collectReferences(node, declarations, refs)
    refs.delete(name) // Remove self-reference
    references.set(name, refs)
  }

  // 3. Walk from surviving exports to find all reachable declarations
  const reachable = new Set<string>()

  function markReachable(name: string) {
    if (reachable.has(name)) return
    reachable.add(name)
    const refs = references.get(name)
    if (refs) {
      for (const ref of refs) markReachable(ref)
    }
  }

  for (const name of survivingExports) {
    if (declarations.has(name)) markReachable(name)
  }

  // 4. Transform: remove unreachable declarations
  const transformer: ts.TransformerFactory<ts.SourceFile> = () => {
    return (sf) => {
      const filtered = sf.statements.filter((stmt) => {
        const names = stmtNames.get(stmt) ?? []
        if (names.length === 0) return true
        return names.some((n) => reachable.has(n))
      })

      return ts.factory.updateSourceFile(sf, filtered)
    }
  }

  const result = ts.transform(sourceFile, [transformer])
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  const printed = printer.printFile(result.transformed[0])
  result.dispose()

  return printed
}

function getDeclaredNames(node: ts.Node): string[] {
  if (ts.isFunctionDeclaration(node) && node.name) {
    return [node.name.text]
  }
  if (ts.isVariableStatement(node)) {
    return node.declarationList.declarations
      .filter((d) => ts.isIdentifier(d.name))
      .map((d) => (d.name as ts.Identifier).text)
  }
  if (ts.isClassDeclaration(node) && node.name) {
    return [node.name.text]
  }
  // Re-exports: export { spawn } or export { spawn } from "./internal/spawn"
  if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
    return node.exportClause.elements.map((e) => e.name.text)
  }
  return []
}

function collectReferences(node: ts.Node, declarations: Map<string, ts.Node>, refs: Set<string>) {
  if (ts.isIdentifier(node)) {
    if (declarations.has(node.text)) {
      refs.add(node.text)
    }
  }

  ts.forEachChild(node, (child) => collectReferences(child, declarations, refs))
}
