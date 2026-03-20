/**
 * Minimal Lua formatter that collapses TSTL's multi-line function call
 * arguments onto fewer lines and adds blank lines between top-level statements.
 */
export function formatLua(input: string): string {
  if (!input.trim()) return input

  let lines = input.split("\n")

  // Process bottom-up so inner calls collapse before outer ones
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/\(\s*$/.test(lines[i])) {
      const result = tryCollapse(lines, i)
      if (result) lines = result
    }
  }

  lines = addTopLevelSpacing(lines)

  return lines.join("\n")
}

interface ParsedArg {
  type: "simple" | "function"
  text: string
  bodyLines: string[]
}

function tryCollapse(lines: string[], openIdx: number): string[] | null {
  const openLine = lines[openIdx]
  const match = openLine.match(/^(\s*)(.*)\(\s*$/)
  if (!match) return null

  const indent = match[1]
  const prefix = match[2]
  const argIndent = indent + "    "

  // Find matching close paren at the same indent level
  let closeIdx = -1
  let closeSuffix = ""
  for (let j = openIdx + 1; j < lines.length; j++) {
    if (lines[j] === indent + ")" || lines[j] === indent + "),") {
      closeIdx = j
      closeSuffix = lines[j].endsWith(",") ? "," : ""
      break
    }
  }
  if (closeIdx === -1) return null

  const args = parseArgs(lines, openIdx + 1, closeIdx, argIndent)
  if (!args || args.length === 0) return null

  // Bail if a function arg is not the last arg
  for (let a = 0; a < args.length - 1; a++) {
    if (args[a].type === "function") return null
  }

  const lastArg = args[args.length - 1]

  if (lastArg.type === "function") {
    const allArgs = args.map((a) => a.text).join(", ")
    const headerLine = `${indent}${prefix}(${allArgs}`

    const dedentedBody = lastArg.bodyLines.map((line) => {
      if (line.length === 0) return line
      if (line.startsWith(argIndent)) return indent + line.slice(argIndent.length)
      return line
    })

    const endLine = `${indent}end)${closeSuffix}`

    const newLines = [headerLine, ...dedentedBody, endLine]
    const result = [...lines]
    result.splice(openIdx, closeIdx - openIdx + 1, ...newLines)
    return result
  }

  // All simple args — collapse to one line if it fits
  const allArgs = args.map((a) => a.text).join(", ")
  const collapsed = `${indent}${prefix}(${allArgs})${closeSuffix}`
  if (collapsed.length > 120) return null

  const result = [...lines]
  result.splice(openIdx, closeIdx - openIdx + 1, collapsed)
  return result
}

function parseArgs(
  lines: string[],
  startIdx: number,
  endIdx: number,
  argIndent: string,
): ParsedArg[] | null {
  const args: ParsedArg[] = []
  let i = startIdx

  while (i < endIdx) {
    const line = lines[i]
    if (!line.startsWith(argIndent)) return null

    const content = line.slice(argIndent.length)

    if (/^function\s*\(/.test(content)) {
      const funcHeader = content.replace(/,\s*$/, "")
      const bodyLines: string[] = []
      i++

      while (i < endIdx) {
        if (lines[i] === argIndent + "end" || lines[i] === argIndent + "end,") break
        bodyLines.push(lines[i])
        i++
      }

      if (i >= endIdx) return null
      i++ // skip the end line

      args.push({ type: "function", text: funcHeader, bodyLines })
      continue
    }

    args.push({ type: "simple", text: content.replace(/,\s*$/, ""), bodyLines: [] })
    i++
  }

  return args
}

function addTopLevelSpacing(lines: string[]): string[] {
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (
      i > 0 &&
      line.length > 0 &&
      !line.startsWith(" ") &&
      !line.startsWith("\t") &&
      !/^(end|else|elseif|until|\})/.test(line) &&
      result.length > 0 &&
      result[result.length - 1] !== ""
    ) {
      result.push("")
    }

    result.push(line)
  }

  return result
}
