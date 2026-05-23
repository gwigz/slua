# `@gwigz/slua-oxlint-config`

Shared [oxlint](https://oxc.rs/docs/guide/usage/linter) config for [TSTL-SLua](https://github.com/gwigz/slua) projects. Catches TypeScript patterns that don't work in SLua or pull in large TSTL runtime helpers.

## Installation

```sh
npm install -D @gwigz/slua-oxlint-config oxlint oxlint-tsgolint
# or
bun add -D @gwigz/slua-oxlint-config oxlint oxlint-tsgolint
```

`oxlint-tsgolint` is only needed for the type-aware rule (see below). If you
don't run oxlint with `--type-aware`, you can omit it.

## Usage

Extend the config in your `.oxlintrc.json`:

```json
{
  "extends": ["./node_modules/@gwigz/slua-oxlint-config/.oxlintrc.json"]
}
```

Run with `--type-aware` so the type-aware `strict-boolean-expressions` rule is
active (without it, that rule is silently skipped):

```sh
oxlint --type-aware
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

### Truthiness (type-aware)

`strict-boolean-expressions` (`allowNumber: false`, `allowString: false`) flags
bare numbers and strings used as conditions. `0` and `""` are falsy in
JavaScript but **truthy** in Lua, so `if (str)`, `while (count)`, or
`found && text.indexOf("x")` change meaning once transpiled to SLua. Use
explicit comparisons instead — `s.length > 0`, `count !== 0`, `pos !== -1`.

This rule is type-aware, so it only runs under `oxlint --type-aware` and needs
`oxlint-tsgolint` installed.
