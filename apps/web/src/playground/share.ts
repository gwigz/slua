import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string"
import type { OptimizeFlags } from "@gwigz/slua-tstl-plugin"

export interface SharedState {
  code: string
  optimize?: OptimizeFlags
}

const HASH_PREFIX = "#code/"

/** Encodes shareable state into a URL hash (`#code/<lz-compressed>`). */
export function encodeShared(state: SharedState): string {
  return HASH_PREFIX + compressToEncodedURIComponent(JSON.stringify(state))
}

/** Decodes shareable state from a URL hash, or null if absent/invalid. */
export function decodeShared(hash: string): SharedState | null {
  if (!hash.startsWith(HASH_PREFIX)) {
    return null
  }

  try {
    const json = decompressFromEncodedURIComponent(hash.slice(HASH_PREFIX.length))
    const parsed = json ? JSON.parse(json) : null

    return parsed && typeof parsed.code === "string" ? parsed : null
  } catch {
    return null
  }
}
