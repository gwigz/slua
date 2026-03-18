/// <reference path="../../packages/types/index.d.ts" />

/** Only JSDoc comments are preserved in the Lua output */
const owner = ll.GetOwner()

// This comment will be stripped from the output
LLEvents.on("touch_start", (events) => {
  for (const event of events) {
    const key = event.getKey()

    if (key === owner) {
      ll.Say(0, `Hello secondlife:///app/agent/${key}/about!`)

      return
    }
  }
})
