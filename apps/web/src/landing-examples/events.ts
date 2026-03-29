let owner = ll.GetOwner()

LLEvents.on("changed", (changed) => {
  if ((changed & CHANGED_OWNER) !== 0) {
    owner = ll.GetOwner()
  }
})

LLEvents.on("touch_start", (events) => {
  for (const event of events) {
    if (event.getKey() === owner) {
      ll.Say(0, `${event.getName()} touched at ${event.getTouchPos()}`)
    }
  }
})
