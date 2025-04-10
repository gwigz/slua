# `@gwigz/slua-web`

SLua-like runtime for the web

## Features

- Emulates SLua scripts
- Luau Emscripten build
- TypeScript support

## Installation

```bash
npm install @gwigz/slua-web
```

## Usage

```js
import slua from '@gwigz/slua-web'

const script = `
function touch_start(num_detected)
  ll.OwnerSay("Ow!")
end

ll.OwnerSay("Hi!")
`

const { script, output, errors } = await slua.runScript(script, {
  onChat: ({ timestamp, name, data: message }) => {
    output.push(timestamp, name, message)
  },
})

if (result.errors?.length) {
  // something went wrong during start
  console.error('SLua Error', result.errors)
} else {
  // call events, etc.
  script.touch(1)
}

// cleanup (currently just removes timers)
script.dispose()
```

## Links

- [GitHub Repository](https://github.com/gwigz/slua)
- [Issue Tracker](https://github.com/gwigz/slua/issues)
