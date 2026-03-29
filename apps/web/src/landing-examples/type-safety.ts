const origin = ll.GetPos()
const offset = new Vector(0, 0, 2.5)
const white = new Vector(1, 1, 1)

ll.SetText("Hover pad", white, 1.0)

LLEvents.on("touch_start", (events) => {
  const name = events[0].getName()
  const pos = events[0].getTouchPos()

  if (ll.VecDist(pos, origin) < 5.0) {
    ll.SetPos(origin + offset)
    ll.Say(0, `Activated by ${name}`)
  }
})
