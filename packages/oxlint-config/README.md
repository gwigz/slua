# `@gwigz/slua-oxlint-config`

Shared [oxlint](https://oxc.rs/docs/guide/usage/linter) config for [TSTL-SLua](https://github.com/gwigz/slua) projects. Catches TypeScript patterns that don't work in SLua or pull in large TSTL runtime helpers.

## Installation

```sh
npm install -D @gwigz/slua-oxlint-config oxlint
# or
bun add -D @gwigz/slua-oxlint-config oxlint
```

## Usage

Extend the config in your `.oxlintrc.json`:

```json
{
  "extends": ["./node_modules/@gwigz/slua-oxlint-config/.oxlintrc.json"]
}
```

## What's Enforced

### Banned Globals

`Map`, `Set`, `WeakMap`, `WeakSet`, `Promise`, `fetch`, `document`, `window`, `XMLHttpRequest`, `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, `require`, `process`, `Buffer`, `__dirname`, `__filename`

### Banned Syntax

| Pattern               | Reason                                  |
| --------------------- | --------------------------------------- |
| `async` / `await`     | Not supported in SLua                   |
| `delete obj.key`      | Pulls in ~150 lines of TSTL runtime     |
| `.splice()`           | Pulls in ~75 lines of runtime           |
| `Object.entries()`    | Use `for...in` or `Object.keys()`       |
| `.length = 0`         | Reassign to a new array instead         |
| `function*` / `yield` | Generators not supported in SLua        |
| `new Promise()`       | Use `@gwigz/slua-modules/yield` instead |
