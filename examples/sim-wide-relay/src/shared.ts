// Change this to a unique channel for your deployment
export const PRIVATE_CHANNEL = -1731704569

// Avatars to exclude from the relay (bots, alts, etc.)
export const IGNORED_AVATARS: string[] = [
  // "00000000-0000-0000-0000-000000000000",
]

/** Time bucket size in seconds for message signing */
const SIGN_WINDOW = 2

// Separate nonce for signing -- not transmitted on the wire unlike the channel
const SIGN_NONCE = -1977872753

export function sign(payload: string) {
  const bucket = Math.floor(ll.GetUnixTime() / SIGN_WINDOW)

  return ll.MD5String(`${bucket}|${payload}`, SIGN_NONCE).substring(0, 8) + "|" + payload
}

export function verify(text: string) {
  if (text.length < 10) {
    return undefined
  }

  const hash = text.substring(0, 8)
  const payload = text.substring(9)
  const bucket = Math.floor(ll.GetUnixTime() / SIGN_WINDOW)

  if (
    hash === ll.MD5String(`${bucket}|${payload}`, SIGN_NONCE).substring(0, 8) ||
    hash === ll.MD5String(`${bucket - 1}|${payload}`, SIGN_NONCE).substring(0, 8)
  ) {
    return payload
  }

  return undefined
}
