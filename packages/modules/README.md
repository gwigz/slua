# `@gwigz/slua-modules`

Shared runtime modules for [TSTL-SLua](https://github.com/gwigz/slua) projects.

Modules are vendored, the CLI copies their TypeScript source into your project,
no package dependency is added and the code is yours to edit.

## Add to your project

```sh
npx @gwigz/slua-modules add yield
# or
pnpm dlx @gwigz/slua-modules add yield
# or
bunx @gwigz/slua-modules add yield
```

Modules land in `src/modules/` (or `modules/` when there is no `src/`
directory), pass `--dir` to override. Run `bunx @gwigz/slua-modules list` to
see what is available.

## Modules

| Module      | Description                                                        |
| ----------- | ------------------------------------------------------------------ |
| `config`    | Typed notecard config with YAML and lljson parsers                 |
| `utilities` | Rate-limiting primitives for debounce, throttle, and cooldown      |
| `yield`     | Coroutine wrappers that flatten callback APIs into sequential code |
| `testing`   | Mock utilities for unit testing SLua modules                       |

## Documentation

Full API reference and usage examples are available at [slua.gwigz.link/docs/modules](https://slua.gwigz.link/docs/modules).
