const ADMIN = "a822ff2b-ff02-461d-b45d-dcd10a2de0c2"

LLEvents.on("touch_start", (events) => {
  const who = events[0].getKey()

  if (who === ADMIN) {
    ll.Say(0, `${events[0].getName()} has admin access`)
  }
})
