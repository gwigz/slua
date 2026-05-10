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

  // 4. Remove unreachable declarations
  const transformer: ts.TransformerFactory<ts.SourceFile> = () => {
    return (sf) => {
      const survivors: ts.Statement[] = []
      for (const stmt of sf.statements) {
        if (ts.isExportDeclaration(stmt) && stmt.isTypeOnly) {
          survivors.push(stmt)
          continue
        }
        const names = stmtNames.get(stmt) ?? []
        if (names.length === 0) {
          survivors.push(stmt)
          continue
        }
        if (
          ts.isExportDeclaration(stmt) &&
          stmt.exportClause &&
          ts.isNamedExports(stmt.exportClause)
        ) {
          const liveElements = stmt.exportClause.elements.filter(
            (e) => e.isTypeOnly || reachable.has(e.name.text),
          )
          if (liveElements.length === 0) continue
          if (liveElements.length < stmt.exportClause.elements.length) {
            survivors.push(
              ts.factory.updateExportDeclaration(
                stmt,
                stmt.modifiers,
                stmt.isTypeOnly,
                ts.factory.updateNamedExports(stmt.exportClause, liveElements),
                stmt.moduleSpecifier,
                stmt.attributes,
              ),
            )
            continue
          }
          survivors.push(stmt)
          continue
        }
        const liveNames = names.filter((n) => reachable.has(n))
        if (liveNames.length === 0) continue
        survivors.push(stmt)
      }

      const usedIdentifiers = new Set<string>()
      const collectUsed = (node: ts.Node) => {
        if (ts.isIdentifier(node)) usedIdentifiers.add(node.text)
        ts.forEachChild(node, collectUsed)
      }
      for (const stmt of survivors) {
        if (!ts.isImportDeclaration(stmt)) collectUsed(stmt)
      }

      const filtered = survivors.filter((stmt) => {
        if (!ts.isImportDeclaration(stmt)) return true
        const bindings = getImportedBindings(stmt)
        // Side-effect imports (`import "./foo"`) have no bindings; preserve.
        if (bindings.length === 0) return true
        return bindings.some((b) => usedIdentifiers.has(b))
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
    return
  }

  // For re-exports with a module specifier (`export { a, b } from "./x"`), the
  // sibling specifiers don't reference each other — each name is an independent
  // pass-through. Skip recursion so reachability of one name doesn't drag
  // siblings in. Local named exports without `from` still recurse, since their
  // specifiers reference local declarations of the same name.
  if (
    ts.isExportDeclaration(node) &&
    node.exportClause &&
    ts.isNamedExports(node.exportClause) &&
    node.moduleSpecifier
  ) {
    return
  }

  ts.forEachChild(node, (child) => collectReferences(child, declarations, refs))
}

/** Local-binding names introduced by an import statement. Empty for side-effect imports. */
function getImportedBindings(stmt: ts.ImportDeclaration): string[] {
  const clause = stmt.importClause
  if (!clause) return []
  const names: string[] = []
  if (clause.name) {
    names.push(clause.name.text)
  }
  if (clause.namedBindings) {
    if (ts.isNamespaceImport(clause.namedBindings)) {
      names.push(clause.namedBindings.name.text)
    } else {
      for (const element of clause.namedBindings.elements) {
        names.push(element.name.text)
      }
    }
  }
  return names
}
