import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { dirname, isAbsolute, join, resolve } from "node:path"

const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

const CHAR_TO_INT = new Map<string, number>([...BASE64].map((char, index) => [char, index]))

/**
 * Decodes one line's worth of base64 VLQ segments.
 *
 * Rolled by hand rather than pulled from a dependency. Line granularity is
 * all we need, so this is a few dozen lines against a whole package.
 */
function decodeSegments(line: string): number[][] {
  const segments: number[][] = []

  for (const raw of line.split(",")) {
    if (raw === "") continue

    const values: number[] = []

    let shift = 0
    let value = 0

    for (const char of raw) {
      const digit = CHAR_TO_INT.get(char)

      if (digit === undefined) return segments

      const continued = (digit & 32) !== 0

      value += (digit & 31) << shift

      if (continued) {
        shift += 5

        continue
      }

      const negative = (value & 1) === 1

      value >>= 1
      values.push(negative ? -value : value)

      shift = 0
      value = 0
    }

    segments.push(values)
  }

  return segments
}

export interface SourceLocation {
  /** Absolute path to the original file. */
  source: string
  /** 1-based line in the original file. */
  line: number
}

/** A parsed source map, queried by generated line only. */
export class SourceMap {
  /** Index is the 0-based generated line; value is its first mapped location. */
  private readonly lines: (SourceLocation | undefined)[]
  /** Every original file the map refers to, resolved to absolute paths. */
  readonly sources: readonly string[]

  private constructor(lines: (SourceLocation | undefined)[], sources: string[]) {
    this.lines = lines
    this.sources = sources
  }

  /** Maps a 1-based generated line to its original location. */
  mapRow(row: number): SourceLocation | undefined {
    if (row < 1) return undefined

    return this.lines[row - 1]
  }

  static parse(
    json: string,
    mapDir: string,
    resolveSource: (source: string, mapDir: string) => string = defaultResolve,
  ): SourceMap | undefined {
    let raw: {
      mappings?: string
      sources?: string[]
      sourceRoot?: string
    }

    try {
      raw = JSON.parse(json)
    } catch {
      return undefined
    }

    if (typeof raw.mappings !== "string" || !Array.isArray(raw.sources)) {
      return undefined
    }

    const root = raw.sourceRoot ?? ""
    const sources = raw.sources.map((source) =>
      isAbsolute(source) ? source : resolveSource(join(root, source), mapDir),
    )
    const lines: (SourceLocation | undefined)[] = []

    // Only the generated column resets per line; the other fields carry across.
    let sourceIndex = 0
    let sourceLine = 0

    for (const group of raw.mappings.split(";")) {
      let best: SourceLocation | undefined
      let bestColumn = Number.POSITIVE_INFINITY
      let generatedColumn = 0

      for (const segment of decodeSegments(group)) {
        generatedColumn += segment[0]

        if (segment.length < 4) continue

        sourceIndex += segment[1]
        sourceLine += segment[2]

        // Prefer the leftmost mapping on the line; that is the statement the
        // compiler's line number refers to.
        const source = sources[sourceIndex]

        // A segment pointing outside `sources` is no better than no mapping.
        // An empty path would be reported as the error's file and hide the
        // fallback to the pushed file.
        if (source !== undefined && generatedColumn < bestColumn) {
          bestColumn = generatedColumn
          best = { source, line: sourceLine + 1 }
        }
      }

      lines.push(best)
    }

    return new SourceMap(lines, sources)
  }
}

function defaultResolve(source: string, mapDir: string): string {
  return resolve(mapDir, source)
}

/**
 * Resolves a map's source path, tolerating a wrong number of leading `..`.
 *
 * TSTL writes `sources` for a bundle relative to where the entry file *would*
 * have been emitted rather than where the bundle actually lands, so a bundled
 * build points one directory too high. Walking the prefix down to the first
 * path that exists recovers the real file without having to guess the layout.
 */
export function resolveExistingSource(source: string, mapDir: string): string {
  const direct = resolve(mapDir, source)

  if (existsSync(direct)) return direct

  let trimmed = source

  while (trimmed.startsWith("../")) {
    trimmed = trimmed.slice(3)

    const candidate = resolve(mapDir, trimmed)

    if (existsSync(candidate)) return candidate
  }

  return direct
}

/**
 * Loads the map TSTL writes beside an emitted file (`<output>.map`).
 *
 * Returns undefined when there is no map, or it cannot be read or parsed.
 * Callers then report raw generated line numbers.
 */
export async function loadSourceMapFor(filePath: string): Promise<SourceMap | undefined> {
  const mapPath = `${filePath}.map`

  try {
    return SourceMap.parse(
      await readFile(mapPath, "utf8"),
      dirname(resolve(mapPath)),
      resolveExistingSource,
    )
  } catch {
    return undefined
  }
}
