LLEvents.on("touch_start", (events) => {
  const who = events[0].getName()

  setPrimParams(LINK_THIS)
    .text(`Touched by ${who}`, new Vector(0.5, 1, 0.5), 1)
    .glow(ALL_SIDES, 0.2)
    .link(2, (link) => link.color(ALL_SIDES, new Vector(1, 0.8, 0), 1))
})
