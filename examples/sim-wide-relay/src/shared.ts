/** Derives a unique positive command channel for an avatar */
export function commandChannel(avatarKey: string, nonce: number): number {
  const hash = ll.MD5String(avatarKey, nonce)

  return (tonumber("0x" + hash.substring(0, 7))! % 10_000_000) + 1
}

export function sign(payload: string, nonce: number, window: number) {
  const bucket = Math.floor(ll.GetUnixTime() / window)

  return ll.MD5String(`${bucket}|${payload}`, nonce).substring(0, 8) + "|" + payload
}

export function verify(text: string, nonce: number, window: number) {
  if (text.length < 10) {
    return undefined
  }

  const hash = text.substring(0, 8)
  const payload = text.substring(9)
  const bucket = Math.floor(ll.GetUnixTime() / window)

  if (
    hash === ll.MD5String(`${bucket}|${payload}`, nonce).substring(0, 8) ||
    hash === ll.MD5String(`${bucket - 1}|${payload}`, nonce).substring(0, 8)
  ) {
    return payload
  }

  return undefined
}
