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

const example = `
function touch_start(num_detected)
  ll.OwnerSay("Ow!")
end

ll.OwnerSay("Hi!")
`

const script = await slua.runScript(example, {
  onError: ({ timestamp, line, data }) => {
    console.error(timestamp, line, data)
  },
  onChat: ({ timestamp, name, data }) => {
    console.log(timestamp, name, data)
  },
})

if (script) {
  script.touch(1)

  // cleanup (currently just removes timers)
  script.dispose()
}
```

## Acknowledgements

- [WolfGangS/sl_lua_types](https://github.com/WolfGangS/sl_lua_types) providing typedefs and docs

## Links

- [GitHub Repository](https://github.com/gwigz/slua)
- [Issue Tracker](https://github.com/gwigz/slua/issues)
