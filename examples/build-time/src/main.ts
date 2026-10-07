/**
 * A light with a touch menu. Touch it to adjust brightness, glow, and size,
 * switch it on or off, and save or load a preset.
 *
 * Field offsets, switch bits, and buttons are const enums, so the compiled
 * script holds plain numbers. The only names it keeps are the button labels,
 * because the menu shows them.
 */
import { Flag, Offset, PRESET_BYTES } from "./generated/layout"
import { Button, LABELS } from "./generated/menu"
import { trace } from "./trace"

/** How long an unanswered menu keeps listening. */
const MENU_SECONDS = 60
const FALLOFF = 0.75

/** A negative channel, which avatars can only reach through a menu. */
const CHANNEL = -1 - math.random(1, 2_000_000_000)

/** The preset the light starts with, and returns to on Reset. */
const defaults = buffer.create(PRESET_BYTES)

buffer.writeu8(defaults, Offset.Intensity, 75)
buffer.writeu8(defaults, Offset.Glow, 10)
buffer.writeu8(defaults, Offset.Radius, 10)
buffer.writeu8(defaults, Offset.Red, 255)
buffer.writeu8(defaults, Offset.Green, 180)
buffer.writeu8(defaults, Offset.Blue, 96)
buffer.writeu8(defaults, Offset.Flags, Flag.Enabled | Flag.CastLight | Flag.OwnerOnly)

/** The preset the light shows now. */
const live = buffer.create(PRESET_BYTES)

/** The preset Save writes and Load reads. */
const saved = buffer.create(PRESET_BYTES)

buffer.copy(live, 0, defaults)
buffer.copy(saved, 0, defaults)

function isOn(flag: Flag) {
  return (buffer.readu8(live, Offset.Flags) & flag) !== 0
}

function toggle(flag: Flag) {
  const flags = buffer.readu8(live, Offset.Flags)

  buffer.writeu8(live, Offset.Flags, isOn(flag) ? flags & ~flag : flags | flag)
}

/**
 * Moves a one-byte field by `by`, kept within 0 and `max`. A byte holds 0 to
 * 255 and wraps outside that, so 256 would read back as 0.
 */
function step(offset: Offset, by: number, max: number) {
  const value = buffer.readu8(live, offset) + by

  buffer.writeu8(live, offset, math.clamp(value, 0, max))
}

function apply() {
  const color = new Vector(
    buffer.readu8(live, Offset.Red) / 255,
    buffer.readu8(live, Offset.Green) / 255,
    buffer.readu8(live, Offset.Blue) / 255,
  )

  $setPrimParams(LINK_THIS)
    .pointLight(
      isOn(Flag.Enabled) && isOn(Flag.CastLight),
      color,
      buffer.readu8(live, Offset.Intensity) / 100,
      buffer.readu8(live, Offset.Radius),
      FALLOFF,
    )
    .glow(ALL_SIDES, isOn(Flag.Enabled) ? buffer.readu8(live, Offset.Glow) / 100 : 0)
    .fullbright(ALL_SIDES, isOn(Flag.Enabled) && isOn(Flag.Fullbright))
}

/** Runs one button. An `if` chain compiles to plain comparisons. */
function press(button: Button) {
  if (button === Button.Dimmer) {
    step(Offset.Intensity, -10, 100)
  } else if (button === Button.Brighter) {
    step(Offset.Intensity, 10, 100)
  } else if (button === Button.LessGlow) {
    step(Offset.Glow, -5, 100)
  } else if (button === Button.MoreGlow) {
    step(Offset.Glow, 5, 100)
  } else if (button === Button.Smaller) {
    step(Offset.Radius, -1, 20)
  } else if (button === Button.Larger) {
    step(Offset.Radius, 1, 20)
  } else if (button === Button.OnOff) {
    toggle(Flag.Enabled)
  } else if (button === Button.Fullbright) {
    toggle(Flag.Fullbright)
  } else if (button === Button.CastLight) {
    toggle(Flag.CastLight)
  } else if (button === Button.Save) {
    buffer.copy(saved, 0, live)
  } else if (button === Button.Load) {
    buffer.copy(live, 0, saved)
  } else if (button === Button.Reset) {
    buffer.copy(live, 0, defaults)
  }

  apply()
}

/** What the menu says above its buttons. */
function describe() {
  const state = isOn(Flag.Enabled) ? "On" : "Off"
  const intensity = buffer.readu8(live, Offset.Intensity)
  const glow = buffer.readu8(live, Offset.Glow)
  const radius = buffer.readu8(live, Offset.Radius)

  return `${state}. Brightness ${intensity}%, glow ${glow}%, radius ${radius} m.`
}

let listener: number | undefined
let expiry: LLTimerCallback | undefined

function closeMenu() {
  if (listener !== undefined) {
    ll.ListenRemove(listener)
  }

  if (expiry !== undefined) {
    LLTimers.off(expiry)
  }

  listener = undefined
  expiry = undefined
}

function openMenu(avatar: UUID) {
  closeMenu()

  // Hears only this avatar, on this channel
  listener = ll.Listen(CHANNEL, "", avatar, "")
  expiry = LLTimers.once(MENU_SECONDS, closeMenu)

  ll.Dialog(avatar, describe(), LABELS, CHANNEL)
}

/** Opens the menu for whoever touched, if they may use it. */
function touched(avatar: UUID) {
  if (isOn(Flag.OwnerOnly) && avatar !== ll.GetOwner()) {
    ll.RegionSayTo(avatar, 0, "Only the owner can adjust this light.")

    return
  }

  if (TRACING) {
    trace(`menu for ${avatar}`)
  }

  openMenu(avatar)
}

/**
 * Handles a menu reply. The listener filters by channel and avatar, but the
 * avatar can type anything on that channel, so only a known label counts.
 */
function replied(avatar: UUID, message: string) {
  const button = LABELS.indexOf(message)

  if (button < 0) {
    return
  }

  if (TRACING) {
    trace(`pressed ${message}`)
  }

  press(button)
  openMenu(avatar)
}

LLEvents.on("touch_start", (detected) => touched(detected[0].getKey()))
LLEvents.on("listen", (_channel, _name, id, message) => replied(id, message))

apply()

if (TRACING) {
  trace(`ready, ${ll.GetUsedMemory()} bytes used`)
}
