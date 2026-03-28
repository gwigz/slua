# `@gwigz/slua-create`

Scaffold new TSTL-powered SLua projects.

<p align="center">
  <img src="../../.github/assets/create.webp" alt="create" width="75%" />
</p>

## Usage

```bash
npx @gwigz/slua-create
# or
pnpm dlx @gwigz/slua-create
# or
bunx @gwigz/slua-create
```

You can also pass a directory as the first argument:

```bash
npx @gwigz/slua-create my-project
# or
pnpm dlx @gwigz/slua-create my-project
# or
bunx @gwigz/slua-create my-project
```

## Templates

- **Single script** provides one `main.ts`, that outputs a single script
- **Multi-script** provides a custom `build.ts` that can build mutiple scripts

## Extras

| Extra             | Description                                                                            |
| ----------------- | -------------------------------------------------------------------------------------- |
| JSX templates     | [@gwigz/jsx-inline](https://github.com/gwigz/jsx-inline)                               |
| Config module     | [@gwigz/slua-modules/config](https://github.com/gwigz/slua/tree/main/packages/modules) |
| Yield module      | [@gwigz/slua-modules/yield](https://github.com/gwigz/slua/tree/main/packages/modules)  |
| StyLua formatting | Lua output formatting via [StyLua](https://github.com/JohnnyMorganz/StyLua)            |
| Linting           | TypeScript linting via [oxlint](https://oxc.rs)                                        |
| Formatting        | TypeScript formatting via [oxfmt](https://oxc.rs)                                      |

## Documentation

Full API reference and usage examples are available at [slua.gwigz.link/docs/create](https://slua.gwigz.link/docs/create).
