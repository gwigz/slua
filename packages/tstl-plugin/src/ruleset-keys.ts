import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import { RULESET_KEYS } from "./generated/ruleset-keys.js"
import { walkExpression } from "./lua-ast-walk.js"

/**
 * Ruleset dicts (`HttpRequestParams`, `CameraParams`, ...) are typed with
 * camelCase keys, but the SLua runtime reads the upstream snake_case keys. Keys
 * are renamed by the property symbol they resolve to, so only properties
 * declared on a ruleset dict type are touched. Accesses that cannot be resolved
 * at compile time are reported by `checkRulesetKeys` instead.
 */

/** camelCase keys whose Lua key differs, the only ones that need renaming. */
const RENAMED_KEYS = new Set(
  Object.values(RULESET_KEYS).flatMap((keys) =>
    Object.entries(keys)
      .filter(([name, luaName]) => name !== luaName)
      .map(([name]) => name),
  ),
)

const DIAGNOSTIC_SOURCE = "@gwigz/slua-tstl-plugin"

export const RULESET_DIAGNOSTIC_CODES = {
  dynamicAccess: 90010,
  unsupportedDestructuring: 90011,
  undeclaredKeys: 90012,
  objectKeys: 90013,
  ambiguousKey: 90014,
} as const

/** The ruleset dict type that declares this property, if it is declared in one. */
function declaringRulesetType(declaration: ts.Declaration) {
  if (!ts.isPropertySignature(declaration)) {
    return undefined
  }

  const literal = declaration.parent

  if (!ts.isTypeLiteralNode(literal) || !ts.isTypeAliasDeclaration(literal.parent)) {
    return undefined
  }

  if (!declaration.getSourceFile().isDeclarationFile) {
    return undefined
  }

  const typeName = literal.parent.name.text

  return typeName in RULESET_KEYS ? typeName : undefined
}

/** Lua key for a property symbol declared on a ruleset dict type. */
export function rulesetLuaKey(symbol: ts.Symbol | undefined) {
  for (const declaration of symbol?.declarations ?? []) {
    const typeName = declaringRulesetType(declaration)

    if (typeName) {
      return RULESET_KEYS[typeName][symbol!.name]
    }
  }

  return undefined
}

/** Whether a property is declared both on a ruleset dict and elsewhere, e.g. via a union. */
function isAmbiguousKey(symbol: ts.Symbol | undefined) {
  const declarations = symbol?.declarations ?? []

  return (
    declarations.some((declaration) => declaringRulesetType(declaration)) &&
    declarations.some((declaration) => !declaringRulesetType(declaration))
  )
}

function constituents(type: ts.Type) {
  return type.isUnion() ? type.types : [type]
}

/** Whether a type is, or is a union including, a ruleset dict type. */
export function isRulesetDictType(type: ts.Type, checker: ts.TypeChecker) {
  return constituents(type).some((member) =>
    checker.getPropertiesOfType(member).some((property) => rulesetLuaKey(property) !== undefined),
  )
}

function staticPropertyName(name: ts.PropertyName | undefined) {
  if (!name) {
    return undefined
  }

  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
    return name.text
  }

  if (ts.isComputedPropertyName(name) && ts.isStringLiteralLike(name.expression)) {
    return name.expression.text
  }

  return undefined
}

/** Lua key for `name` on `type`, when it resolves to a renamed ruleset dict property. */
function luaKeyOnType(type: ts.Type, name: string, checker: ts.TypeChecker) {
  if (!RENAMED_KEYS.has(name)) {
    return undefined
  }

  for (const member of constituents(type)) {
    const luaKey = rulesetLuaKey(checker.getPropertyOfType(member, name))

    if (luaKey) {
      return luaKey
    }
  }

  return undefined
}

function renameStringIndex(expression: tstl.Expression, luaKey: string | undefined) {
  if (luaKey && tstl.isTableIndexExpression(expression) && tstl.isStringLiteral(expression.index)) {
    expression.index.value = luaKey
  }
}

// ---------------------------------------------------------------------------
// Renames, applied to TSTL output from the plugin visitors
// ---------------------------------------------------------------------------

/**
 * Rename the keys of an object literal contextually typed as a ruleset dict.
 * TSTL emits a table, or `__TS__ObjectAssign(...)` with tables between spreads.
 */
export function renameObjectLiteralKeys(
  node: ts.ObjectLiteralExpression,
  result: tstl.Expression,
  checker: ts.TypeChecker,
) {
  const names = node.properties
    .map((property) => staticPropertyName(property.name))
    .filter((name) => name !== undefined && RENAMED_KEYS.has(name))

  if (names.length === 0) {
    return
  }

  const contextualType = checker.getContextualType(node)

  if (!contextualType) {
    return
  }

  const renames = new Map<string, string>()

  for (const name of names) {
    const luaKey = luaKeyOnType(contextualType, name!, checker)

    if (luaKey) {
      renames.set(name!, luaKey)
    }
  }

  if (renames.size === 0) {
    return
  }

  const tables = tstl.isTableExpression(result)
    ? [result]
    : tstl.isCallExpression(result)
      ? result.params.filter((param) => tstl.isTableExpression(param))
      : []

  for (const table of tables) {
    for (const field of table.fields) {
      if (field.key && tstl.isStringLiteral(field.key)) {
        field.key.value = renames.get(field.key.value) ?? field.key.value
      }
    }
  }
}

/** `params.maxBodyLength` -> `params.max_body_length` */
export function renamePropertyAccess(
  node: ts.PropertyAccessExpression,
  result: tstl.Expression,
  checker: ts.TypeChecker,
) {
  if (RENAMED_KEYS.has(node.name.text)) {
    renameStringIndex(result, rulesetLuaKey(checker.getSymbolAtLocation(node.name)))
  }
}

/** `params["maxBodyLength"]` -> `params.max_body_length` */
export function renameElementAccess(
  node: ts.ElementAccessExpression,
  result: tstl.Expression,
  checker: ts.TypeChecker,
) {
  if (ts.isStringLiteralLike(node.argumentExpression)) {
    const type = checker.getTypeAtLocation(node.expression)

    renameStringIndex(result, luaKeyOnType(type, node.argumentExpression.text, checker))
  }
}

/** `delete params.maxBodyLength` -> `__TS__Delete(params, "max_body_length")` */
export function renameDelete(
  node: ts.DeleteExpression,
  result: tstl.Expression,
  checker: ts.TypeChecker,
) {
  const target = skipOuterExpressions(node.expression)

  let luaKey: string | undefined

  if (ts.isPropertyAccessExpression(target) && RENAMED_KEYS.has(target.name.text)) {
    luaKey = rulesetLuaKey(checker.getSymbolAtLocation(target.name))
  } else if (
    ts.isElementAccessExpression(target) &&
    ts.isStringLiteralLike(target.argumentExpression)
  ) {
    const type = checker.getTypeAtLocation(target.expression)

    luaKey = luaKeyOnType(type, target.argumentExpression.text, checker)
  }

  const key = tstl.isCallExpression(result) ? result.params[1] : undefined

  if (luaKey && key && tstl.isStringLiteral(key)) {
    key.value = luaKey
  }
}

/** `"maxBodyLength" in params` -> `params.max_body_length ~= nil` */
export function renameInOperator(
  node: ts.BinaryExpression,
  result: tstl.Expression,
  checker: ts.TypeChecker,
) {
  if (ts.isStringLiteralLike(node.left) && tstl.isBinaryExpression(result)) {
    const type = checker.getTypeAtLocation(node.right)

    renameStringIndex(result.left, luaKeyOnType(type, node.left.text, checker))
  }
}

function collectBindingKeys(
  pattern: ts.BindingPattern,
  checker: ts.TypeChecker,
  renames: Map<string, string>,
  kept: Set<string>,
) {
  const type = checker.getTypeAtLocation(pattern)

  for (const element of pattern.elements) {
    if (ts.isOmittedExpression(element)) {
      continue
    }

    if (ts.isObjectBindingPattern(pattern) && !element.dotDotDotToken) {
      const name =
        staticPropertyName(element.propertyName) ??
        (ts.isIdentifier(element.name) ? element.name.text : undefined)

      if (name && RENAMED_KEYS.has(name)) {
        const luaKey = luaKeyOnType(type, name, checker)

        if (luaKey) {
          renames.set(name, luaKey)
        } else {
          kept.add(name)
        }
      }
    }

    if (ts.isObjectBindingPattern(element.name) || ts.isArrayBindingPattern(element.name)) {
      collectBindingKeys(element.name, checker, renames, kept)
    }
  }
}

/**
 * Keys destructured in one declaration list. The generated Lua indexes cannot
 * be told apart by position, so a key read both from a ruleset dict and from a
 * plain object in the same statement is a conflict and left unrenamed.
 */
export function bindingKeyRenames(
  declarationList: ts.VariableDeclarationList,
  checker: ts.TypeChecker,
) {
  const renames = new Map<string, string>()
  const kept = new Set<string>()

  for (const declaration of declarationList.declarations) {
    if (ts.isObjectBindingPattern(declaration.name) || ts.isArrayBindingPattern(declaration.name)) {
      collectBindingKeys(declaration.name, checker, renames, kept)
    }
  }

  const conflicts = [...kept].filter((name) => renames.has(name))

  for (const name of conflicts) {
    renames.delete(name)
  }

  return { renames, conflicts }
}

/**
 * Rename keys read by destructuring in a `const`/`let` statement. TSTL emits
 * `local maxBodyLength = params.maxBodyLength`, where the generated index has
 * no source position, unlike property accesses written in the initializer.
 */
export function renameBindingKeys(
  declarationList: ts.VariableDeclarationList,
  statements: tstl.Statement[],
  checker: ts.TypeChecker,
) {
  const { renames } = bindingKeyRenames(declarationList, checker)

  if (renames.size === 0) {
    return
  }

  const renameGeneratedIndex = (expression: tstl.Expression) => {
    if (
      tstl.isTableIndexExpression(expression) &&
      expression.line === undefined &&
      tstl.isStringLiteral(expression.index)
    ) {
      expression.index.value = renames.get(expression.index.value) ?? expression.index.value
    }
  }

  for (const statement of statements) {
    if (tstl.isVariableDeclarationStatement(statement) || tstl.isAssignmentStatement(statement)) {
      for (const expression of statement.right ?? []) {
        walkExpression(expression, { expression: renameGeneratedIndex })
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Diagnostics, collected before transformation
// ---------------------------------------------------------------------------

function createDiagnostic(
  node: ts.Node,
  messageText: string,
  code: number,
  category = ts.DiagnosticCategory.Error,
): ts.Diagnostic {
  return {
    file: node.getSourceFile(),
    start: node.getStart(),
    length: node.getWidth(),
    messageText,
    category,
    code,
    source: DIAGNOSTIC_SOURCE,
  }
}

function skipOuterExpressions(expression: ts.Expression): ts.Expression {
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isSatisfiesExpression(expression) ||
    ts.isNonNullExpression(expression) ||
    ts.isTypeAssertionExpression(expression)
  ) {
    return skipOuterExpressions(expression.expression)
  }

  return expression
}

/** Positions where a value is checked against a contextual type. */
function isValuePosition(node: ts.Expression) {
  const parent = node.parent

  return (
    (ts.isCallExpression(parent) && parent.arguments.includes(node)) ||
    (ts.isVariableDeclaration(parent) && parent.initializer === node) ||
    (ts.isBinaryExpression(parent) &&
      parent.right === node &&
      parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) ||
    (ts.isReturnStatement(parent) && parent.expression === node) ||
    (ts.isPropertyAssignment(parent) && parent.initializer === node) ||
    ts.isArrayLiteralExpression(parent) ||
    ts.isSpreadAssignment(parent)
  )
}

/** Whether a binding pattern sits in a `const`/`let` statement, the destructuring renamed in place. */
function isInVariableStatement(pattern: ts.BindingPattern) {
  let node: ts.Node = pattern

  while (
    ts.isBindingElement(node.parent) ||
    ts.isObjectBindingPattern(node.parent) ||
    ts.isArrayBindingPattern(node.parent)
  ) {
    node = node.parent
  }

  return (
    ts.isVariableDeclaration(node.parent) &&
    ts.isVariableDeclarationList(node.parent.parent) &&
    ts.isVariableStatement(node.parent.parent.parent)
  )
}

/** Type of the value destructured by an object literal assignment pattern, if `node` is one. */
function destructuredType(node: ts.ObjectLiteralExpression, checker: ts.TypeChecker) {
  let target: ts.Node = node

  while (ts.isParenthesizedExpression(target.parent)) {
    target = target.parent
  }

  const parent = target.parent

  if (
    ts.isBinaryExpression(parent) &&
    parent.left === target &&
    parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
  ) {
    return checker.getTypeAtLocation(parent.right)
  }

  if (ts.isForOfStatement(parent) && parent.initializer === target) {
    const iterated = checker.getTypeAtLocation(parent.expression)

    return checker.getIndexTypeOfType(iterated, ts.IndexKind.Number)
  }

  return undefined
}

/**
 * Report ruleset dict key usage that compile-time renaming cannot cover:
 * dynamic keys, destructuring outside `const`/`let` statements, rest elements,
 * objects whose camelCase keys are not declared on a ruleset dict type, and
 * `Object.keys`/`Object.entries`, which return the runtime snake_case keys.
 */
export function checkRulesetKeys(program: ts.Program): ts.Diagnostic[] {
  const checker = program.getTypeChecker()
  const diagnostics: ts.Diagnostic[] = []

  const typeName = (node: ts.Node) => checker.typeToString(checker.getTypeAtLocation(node))

  const checkDynamicKey = (node: ts.Node, key: ts.Expression) => {
    if (
      !ts.isStringLiteralLike(key) &&
      !ts.isNumericLiteral(key) &&
      isRulesetDictType(checker.getTypeAtLocation(node), checker)
    ) {
      diagnostics.push(
        createDiagnostic(
          key,
          `Dynamic keys on '${typeName(node)}' cannot be renamed to their Lua names, use a property name instead`,
          RULESET_DIAGNOSTIC_CODES.dynamicAccess,
        ),
      )
    }
  }

  const checkBindingPattern = (pattern: ts.BindingPattern) => {
    if (!ts.isObjectBindingPattern(pattern)) {
      return
    }

    if (!isRulesetDictType(checker.getTypeAtLocation(pattern), checker)) {
      return
    }

    if (!isInVariableStatement(pattern)) {
      diagnostics.push(
        createDiagnostic(
          pattern,
          `Destructuring '${typeName(pattern)}' is only renamed in 'const'/'let' statements, destructure there or use property access`,
          RULESET_DIAGNOSTIC_CODES.unsupportedDestructuring,
        ),
      )

      return
    }

    for (const element of pattern.elements) {
      if (element.dotDotDotToken) {
        diagnostics.push(
          createDiagnostic(
            element,
            `Rest elements on '${typeName(pattern)}' would keep the Lua key names, list the properties instead`,
            RULESET_DIAGNOSTIC_CODES.unsupportedDestructuring,
          ),
        )
      } else if (element.propertyName && ts.isComputedPropertyName(element.propertyName)) {
        checkDynamicKey(pattern, element.propertyName.expression)
      }
    }
  }

  const checkUndeclaredKeys = (node: ts.Expression) => {
    if (ts.isObjectLiteralExpression(skipOuterExpressions(node))) {
      return
    }

    const contextualType = checker.getContextualType(node)

    if (!contextualType || !isRulesetDictType(contextualType, checker)) {
      return
    }

    const undeclared = checker
      .getPropertiesOfType(checker.getTypeAtLocation(node))
      .filter((property) => RENAMED_KEYS.has(property.name) && !rulesetLuaKey(property))
      .map((property) => `'${property.name}'`)

    if (undeclared.length > 0) {
      diagnostics.push(
        createDiagnostic(
          node,
          `${undeclared.join(", ")} would stay camelCase at runtime because this object is not typed as '${checker.typeToString(contextualType)}' where it is created, annotate it there`,
          RULESET_DIAGNOSTIC_CODES.undeclaredKeys,
        ),
      )
    }
  }

  const checkObjectKeys = (node: ts.CallExpression) => {
    const callee = node.expression

    if (
      !ts.isPropertyAccessExpression(callee) ||
      !ts.isIdentifier(callee.expression) ||
      callee.expression.text !== "Object" ||
      (callee.name.text !== "keys" && callee.name.text !== "entries")
    ) {
      return
    }

    const [argument] = node.arguments

    if (argument && isRulesetDictType(checker.getTypeAtLocation(argument), checker)) {
      diagnostics.push(
        createDiagnostic(
          node,
          `Object.${callee.name.text} on '${typeName(argument)}' returns the Lua key names (snake_case), not the TypeScript names`,
          RULESET_DIAGNOSTIC_CODES.objectKeys,
          ts.DiagnosticCategory.Warning,
        ),
      )
    }
  }

  const visit = (node: ts.Node): void => {
    if (ts.isElementAccessExpression(node)) {
      checkDynamicKey(node.expression, node.argumentExpression)
    } else if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.InKeyword &&
      !ts.isPrivateIdentifier(node.left)
    ) {
      checkDynamicKey(node.right, node.left)
    } else if (ts.isObjectBindingPattern(node)) {
      checkBindingPattern(node)
    } else if (ts.isObjectLiteralExpression(node)) {
      const sourceType = destructuredType(node, checker)

      if (sourceType && isRulesetDictType(sourceType, checker)) {
        diagnostics.push(
          createDiagnostic(
            node,
            `Destructuring '${checker.typeToString(sourceType)}' is only renamed in 'const'/'let' statements, destructure there or use property access`,
            RULESET_DIAGNOSTIC_CODES.unsupportedDestructuring,
          ),
        )
      }
    } else if (ts.isPropertyAccessExpression(node) && RENAMED_KEYS.has(node.name.text)) {
      if (isAmbiguousKey(checker.getSymbolAtLocation(node.name))) {
        diagnostics.push(
          createDiagnostic(
            node.name,
            `'${node.name.text}' is a ruleset key on only some members of '${typeName(node.expression)}', narrow the type before accessing it`,
            RULESET_DIAGNOSTIC_CODES.ambiguousKey,
          ),
        )
      }
    } else if (ts.isCallExpression(node)) {
      checkObjectKeys(node)
    } else if (ts.isVariableStatement(node)) {
      for (const name of bindingKeyRenames(node.declarationList, checker).conflicts) {
        diagnostics.push(
          createDiagnostic(
            node,
            `'${name}' is destructured from both a ruleset dict and a plain object in one statement, split it into separate statements`,
            RULESET_DIAGNOSTIC_CODES.ambiguousKey,
          ),
        )
      }
    }

    if (ts.isExpression(node) && node.parent && isValuePosition(node)) {
      checkUndeclaredKeys(node)
    }

    ts.forEachChild(node, visit)
  }

  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      visit(sourceFile)
    }
  }

  return diagnostics
}
