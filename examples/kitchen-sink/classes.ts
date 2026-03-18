/// <reference path="../../packages/types/index.d.ts" />

/** Parameter properties -- shorthand for declaring and assigning constructor params */
class Greeter {
  constructor(
    private readonly channel: number,
    private readonly prefix: string = "Says",
  ) {}

  greet(name: string): void {
    ll.Say(this.channel, `${this.prefix}: Hello ${name}!`)
  }

  getChannel(): number {
    return this.channel
  }
}

/** Inheritance with extends */
class LoudGreeter extends Greeter {
  constructor(channel: number) {
    super(channel, "Shouts")
  }

  greet(name: string): void {
    ll.Shout(this.getChannel(), `HELLO ${name}!!!`)
  }
}

/** Static members */
class Counter {
  private static count = 0

  static increment(): number {
    Counter.count += 1
    return Counter.count
  }

  static reset(): void {
    Counter.count = 0
  }

  static getCount(): number {
    return Counter.count
  }
}

const greeter = new Greeter(0)
const loud = new LoudGreeter(0)

greeter.greet("World")
loud.greet("World")

Counter.increment()
Counter.increment()
ll.Say(0, `Count: ${tostring(Counter.getCount())}`)

export { Greeter, LoudGreeter, Counter }
