import * as lua from "typescript-to-lua"

export type BlockVisitor = (statements: lua.Statement[]) => void

function walkExpression(expr: lua.Expression, blockVisitor: BlockVisitor): void {
  switch (expr.kind) {
    case lua.SyntaxKind.StringLiteral:
    case lua.SyntaxKind.NumericLiteral:
    case lua.SyntaxKind.NilKeyword:
    case lua.SyntaxKind.DotsKeyword:
    case lua.SyntaxKind.ArgKeyword:
    case lua.SyntaxKind.TrueKeyword:
    case lua.SyntaxKind.FalseKeyword:
    case lua.SyntaxKind.Identifier:
      break

    case lua.SyntaxKind.BinaryExpression: {
      const bin = expr as lua.BinaryExpression
      walkExpression(bin.left, blockVisitor)
      walkExpression(bin.right, blockVisitor)
      break
    }

    case lua.SyntaxKind.UnaryExpression:
      walkExpression((expr as lua.UnaryExpression).operand, blockVisitor)
      break

    case lua.SyntaxKind.ParenthesizedExpression:
      walkExpression((expr as lua.ParenthesizedExpression).expression, blockVisitor)
      break

    case lua.SyntaxKind.ConditionalExpression: {
      const cond = expr as lua.ConditionalExpression
      walkExpression(cond.condition, blockVisitor)
      walkExpression(cond.whenTrue, blockVisitor)
      walkExpression(cond.whenFalse, blockVisitor)
      break
    }

    case lua.SyntaxKind.CallExpression: {
      const call = expr as lua.CallExpression
      walkExpression(call.expression, blockVisitor)
      for (const p of call.params) walkExpression(p, blockVisitor)
      break
    }

    case lua.SyntaxKind.MethodCallExpression: {
      const mc = expr as lua.MethodCallExpression
      walkExpression(mc.prefixExpression, blockVisitor)
      for (const p of mc.params) walkExpression(p, blockVisitor)
      break
    }

    case lua.SyntaxKind.TableIndexExpression: {
      const ti = expr as lua.TableIndexExpression
      walkExpression(ti.table, blockVisitor)
      walkExpression(ti.index, blockVisitor)
      break
    }

    case lua.SyntaxKind.TableExpression:
      for (const f of (expr as lua.TableExpression).fields) {
        walkExpression(f.value, blockVisitor)
        if (f.key) walkExpression(f.key, blockVisitor)
      }
      break

    case lua.SyntaxKind.FunctionExpression: {
      const fn = expr as lua.FunctionExpression
      walkBlock(fn.body, blockVisitor)
      break
    }

    case lua.SyntaxKind.TableFieldExpression: {
      const tf = expr as lua.TableFieldExpression
      walkExpression(tf.value, blockVisitor)
      if (tf.key) walkExpression(tf.key, blockVisitor)
      break
    }
  }
}

function walkStatement(stmt: lua.Statement, blockVisitor: BlockVisitor): void {
  switch (stmt.kind) {
    case lua.SyntaxKind.DoStatement:
      walkBlock(stmt as lua.DoStatement, blockVisitor)
      break

    case lua.SyntaxKind.VariableDeclarationStatement: {
      const vds = stmt as lua.VariableDeclarationStatement
      if (vds.right) {
        for (const r of vds.right) walkExpression(r, blockVisitor)
      }
      break
    }

    case lua.SyntaxKind.AssignmentStatement: {
      const as_ = stmt as lua.AssignmentStatement
      for (const l of as_.left) walkExpression(l, blockVisitor)
      for (const r of as_.right) walkExpression(r, blockVisitor)
      break
    }

    case lua.SyntaxKind.IfStatement: {
      const is_ = stmt as lua.IfStatement
      walkExpression(is_.condition, blockVisitor)
      walkBlock(is_.ifBlock, blockVisitor)
      if (is_.elseBlock) {
        if (lua.isIfStatement(is_.elseBlock)) {
          walkStatement(is_.elseBlock, blockVisitor)
        } else {
          walkBlock(is_.elseBlock, blockVisitor)
        }
      }
      break
    }

    case lua.SyntaxKind.WhileStatement: {
      const ws = stmt as lua.WhileStatement
      walkExpression(ws.condition, blockVisitor)
      walkBlock(ws.body, blockVisitor)
      break
    }

    case lua.SyntaxKind.RepeatStatement: {
      const rs = stmt as lua.RepeatStatement
      walkExpression(rs.condition, blockVisitor)
      walkBlock(rs.body, blockVisitor)
      break
    }

    case lua.SyntaxKind.ForStatement: {
      const fs = stmt as lua.ForStatement
      walkExpression(fs.controlVariableInitializer, blockVisitor)
      walkExpression(fs.limitExpression, blockVisitor)
      if (fs.stepExpression) walkExpression(fs.stepExpression, blockVisitor)
      walkBlock(fs.body, blockVisitor)
      break
    }

    case lua.SyntaxKind.ForInStatement: {
      const fis = stmt as lua.ForInStatement
      for (const e of fis.expressions) walkExpression(e, blockVisitor)
      walkBlock(fis.body, blockVisitor)
      break
    }

    case lua.SyntaxKind.ReturnStatement:
      for (const e of (stmt as lua.ReturnStatement).expressions) walkExpression(e, blockVisitor)
      break

    case lua.SyntaxKind.ExpressionStatement:
      walkExpression((stmt as lua.ExpressionStatement).expression, blockVisitor)
      break

    case lua.SyntaxKind.GotoStatement:
    case lua.SyntaxKind.LabelStatement:
    case lua.SyntaxKind.BreakStatement:
    case lua.SyntaxKind.ContinueStatement:
      break
  }
}

function walkBlock(block: { statements: lua.Statement[] }, blockVisitor: BlockVisitor): void {
  blockVisitor(block.statements)
  for (const stmt of block.statements) {
    walkStatement(stmt, blockVisitor)
  }
}

/** Walk all statement arrays in a File. Depth-first. */
export function walkBlocks(file: lua.File, visitor: BlockVisitor): void {
  walkBlock(file, visitor)
}

type IdentifierCallback = (id: lua.Identifier) => void

function walkExpressionIds(expr: lua.Expression, cb: IdentifierCallback): void {
  switch (expr.kind) {
    case lua.SyntaxKind.Identifier:
      cb(expr as lua.Identifier)
      break

    case lua.SyntaxKind.StringLiteral:
    case lua.SyntaxKind.NumericLiteral:
    case lua.SyntaxKind.NilKeyword:
    case lua.SyntaxKind.DotsKeyword:
    case lua.SyntaxKind.ArgKeyword:
    case lua.SyntaxKind.TrueKeyword:
    case lua.SyntaxKind.FalseKeyword:
      break

    case lua.SyntaxKind.BinaryExpression: {
      const bin = expr as lua.BinaryExpression
      walkExpressionIds(bin.left, cb)
      walkExpressionIds(bin.right, cb)
      break
    }

    case lua.SyntaxKind.UnaryExpression:
      walkExpressionIds((expr as lua.UnaryExpression).operand, cb)
      break

    case lua.SyntaxKind.ParenthesizedExpression:
      walkExpressionIds((expr as lua.ParenthesizedExpression).expression, cb)
      break

    case lua.SyntaxKind.ConditionalExpression: {
      const cond = expr as lua.ConditionalExpression
      walkExpressionIds(cond.condition, cb)
      walkExpressionIds(cond.whenTrue, cb)
      walkExpressionIds(cond.whenFalse, cb)
      break
    }

    case lua.SyntaxKind.CallExpression: {
      const call = expr as lua.CallExpression
      walkExpressionIds(call.expression, cb)
      for (const p of call.params) walkExpressionIds(p, cb)
      break
    }

    case lua.SyntaxKind.MethodCallExpression: {
      const mc = expr as lua.MethodCallExpression
      walkExpressionIds(mc.prefixExpression, cb)
      walkExpressionIds(mc.name, cb)
      for (const p of mc.params) walkExpressionIds(p, cb)
      break
    }

    case lua.SyntaxKind.TableIndexExpression: {
      const ti = expr as lua.TableIndexExpression
      walkExpressionIds(ti.table, cb)
      walkExpressionIds(ti.index, cb)
      break
    }

    case lua.SyntaxKind.TableExpression:
      for (const f of (expr as lua.TableExpression).fields) {
        walkExpressionIds(f.value, cb)
        if (f.key) walkExpressionIds(f.key, cb)
      }
      break

    case lua.SyntaxKind.FunctionExpression: {
      const fn = expr as lua.FunctionExpression
      if (fn.params) {
        for (const p of fn.params) cb(p)
      }
      walkBlockIds(fn.body, cb)
      break
    }

    case lua.SyntaxKind.TableFieldExpression: {
      const tf = expr as lua.TableFieldExpression
      walkExpressionIds(tf.value, cb)
      if (tf.key) walkExpressionIds(tf.key, cb)
      break
    }
  }
}

function walkStatementIds(stmt: lua.Statement, cb: IdentifierCallback): void {
  switch (stmt.kind) {
    case lua.SyntaxKind.DoStatement:
      walkBlockIds(stmt as lua.DoStatement, cb)
      break

    case lua.SyntaxKind.VariableDeclarationStatement: {
      const vds = stmt as lua.VariableDeclarationStatement
      for (const l of vds.left) cb(l)
      if (vds.right) {
        for (const r of vds.right) walkExpressionIds(r, cb)
      }
      break
    }

    case lua.SyntaxKind.AssignmentStatement: {
      const as_ = stmt as lua.AssignmentStatement
      for (const l of as_.left) walkExpressionIds(l, cb)
      for (const r of as_.right) walkExpressionIds(r, cb)
      break
    }

    case lua.SyntaxKind.IfStatement: {
      const is_ = stmt as lua.IfStatement
      walkExpressionIds(is_.condition, cb)
      walkBlockIds(is_.ifBlock, cb)
      if (is_.elseBlock) {
        if (lua.isIfStatement(is_.elseBlock)) {
          walkStatementIds(is_.elseBlock, cb)
        } else {
          walkBlockIds(is_.elseBlock, cb)
        }
      }
      break
    }

    case lua.SyntaxKind.WhileStatement: {
      const ws = stmt as lua.WhileStatement
      walkExpressionIds(ws.condition, cb)
      walkBlockIds(ws.body, cb)
      break
    }

    case lua.SyntaxKind.RepeatStatement: {
      const rs = stmt as lua.RepeatStatement
      walkExpressionIds(rs.condition, cb)
      walkBlockIds(rs.body, cb)
      break
    }

    case lua.SyntaxKind.ForStatement: {
      const fs = stmt as lua.ForStatement
      cb(fs.controlVariable)
      walkExpressionIds(fs.controlVariableInitializer, cb)
      walkExpressionIds(fs.limitExpression, cb)
      if (fs.stepExpression) walkExpressionIds(fs.stepExpression, cb)
      walkBlockIds(fs.body, cb)
      break
    }

    case lua.SyntaxKind.ForInStatement: {
      const fis = stmt as lua.ForInStatement
      for (const n of fis.names) cb(n)
      for (const e of fis.expressions) walkExpressionIds(e, cb)
      walkBlockIds(fis.body, cb)
      break
    }

    case lua.SyntaxKind.ReturnStatement:
      for (const e of (stmt as lua.ReturnStatement).expressions) walkExpressionIds(e, cb)
      break

    case lua.SyntaxKind.ExpressionStatement:
      walkExpressionIds((stmt as lua.ExpressionStatement).expression, cb)
      break

    case lua.SyntaxKind.GotoStatement:
    case lua.SyntaxKind.LabelStatement:
    case lua.SyntaxKind.BreakStatement:
    case lua.SyntaxKind.ContinueStatement:
      break
  }
}

function walkBlockIds(block: { statements: lua.Statement[] }, cb: IdentifierCallback): void {
  for (const stmt of block.statements) {
    walkStatementIds(stmt, cb)
  }
}

/** Walk all Identifier nodes in a File. Callback may mutate id.text. */
export function walkIdentifiers(file: lua.File, cb: IdentifierCallback): void {
  walkBlockIds(file, cb)
}

/** Check if an expression tree contains an Identifier with the given name. */
export function containsIdentifier(node: lua.Node, name: string): boolean {
  if (lua.isIdentifier(node)) {
    return node.text === name
  }

  // Walk expressions
  if (lua.isBinaryExpression(node)) {
    return containsIdentifier(node.left, name) || containsIdentifier(node.right, name)
  }

  if (lua.isUnaryExpression(node)) {
    return containsIdentifier(node.operand, name)
  }

  if (lua.isParenthesizedExpression(node)) {
    return containsIdentifier(node.expression, name)
  }

  if (lua.isConditionalExpression(node)) {
    return (
      containsIdentifier(node.condition, name) ||
      containsIdentifier(node.whenTrue, name) ||
      containsIdentifier(node.whenFalse, name)
    )
  }

  if (lua.isCallExpression(node)) {
    return (
      containsIdentifier(node.expression, name) ||
      node.params.some((p) => containsIdentifier(p, name))
    )
  }

  if (lua.isMethodCallExpression(node)) {
    return (
      containsIdentifier(node.prefixExpression, name) ||
      containsIdentifier(node.name, name) ||
      node.params.some((p) => containsIdentifier(p, name))
    )
  }

  if (lua.isTableIndexExpression(node)) {
    return containsIdentifier(node.table, name) || containsIdentifier(node.index, name)
  }

  if (lua.isTableExpression(node)) {
    return node.fields.some(
      (f) => containsIdentifier(f.value, name) || (f.key ? containsIdentifier(f.key, name) : false),
    )
  }

  if (lua.isTableFieldExpression(node)) {
    return (
      containsIdentifier(node.value, name) ||
      (node.key ? containsIdentifier(node.key, name) : false)
    )
  }

  if (lua.isFunctionExpression(node)) {
    return node.body.statements.some((s) => containsIdentifierInStatement(s, name))
  }

  // Walk statements
  if (lua.isDoStatement(node)) {
    return node.statements.some((s) => containsIdentifierInStatement(s, name))
  }

  if (lua.isVariableDeclarationStatement(node)) {
    return (
      node.left.some((l) => l.text === name) ||
      (node.right?.some((r) => containsIdentifier(r, name)) ?? false)
    )
  }

  if (lua.isAssignmentStatement(node)) {
    return (
      node.left.some((l) => containsIdentifier(l, name)) ||
      node.right.some((r) => containsIdentifier(r, name))
    )
  }

  if (lua.isIfStatement(node)) {
    if (containsIdentifier(node.condition, name)) return true
    if (node.ifBlock.statements.some((s) => containsIdentifierInStatement(s, name))) return true

    if (node.elseBlock) {
      if (lua.isIfStatement(node.elseBlock)) return containsIdentifier(node.elseBlock, name)
      return node.elseBlock.statements.some((s) => containsIdentifierInStatement(s, name))
    }

    return false
  }

  if (lua.isReturnStatement(node)) {
    return node.expressions.some((e) => containsIdentifier(e, name))
  }

  if (lua.isExpressionStatement(node)) {
    return containsIdentifier(node.expression, name)
  }

  if (lua.isIterationStatement(node)) {
    if (lua.isForStatement(node)) {
      return (
        node.controlVariable.text === name ||
        containsIdentifier(node.controlVariableInitializer, name) ||
        containsIdentifier(node.limitExpression, name) ||
        (node.stepExpression ? containsIdentifier(node.stepExpression, name) : false) ||
        node.body.statements.some((s) => containsIdentifierInStatement(s, name))
      )
    }

    if (lua.isForInStatement(node)) {
      return (
        node.names.some((n) => n.text === name) ||
        node.expressions.some((e) => containsIdentifier(e, name)) ||
        node.body.statements.some((s) => containsIdentifierInStatement(s, name))
      )
    }

    // While / Repeat
    return (
      containsIdentifier((node as lua.WhileStatement | lua.RepeatStatement).condition, name) ||
      node.body.statements.some((s) => containsIdentifierInStatement(s, name))
    )
  }

  return false
}

function containsIdentifierInStatement(stmt: lua.Statement, name: string): boolean {
  return containsIdentifier(stmt, name)
}
