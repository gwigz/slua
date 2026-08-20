import { spawn, dialog } from "@gwigz/slua-modules/yield"

LLEvents.on("touch_start", (events) => {
  // spawn creates a new coroutine
  spawn(() => {
    // dialog blocks this coroutine until the user answers
    // code outside of spawn keeps running
    const [ok, choice] = dialog(
      -49152,
      events[0].getKey(),
      "Pick a color:",
      ["Red", "Green", "Blue"],
      60,
    )

    if (ok) {
      ll.Say(0, `${events[0].getName()} picked ${choice}`)
    } else {
      ll.Say(0, "Selection timed out")
    }
  })
})
