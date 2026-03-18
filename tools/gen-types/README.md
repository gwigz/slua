# `@gwigz/slua-gen-types`

Internal tool that generates `@gwigz/slua-types` from the upstream YAML definition files.

## How it works

1. Parses `slua_definitions.yaml` and `lsl_definitions.yaml` using `js-yaml`
2. Maps Luau types to TypeScript (optionals, arrays, tables, function types, unions)
3. Emits a single `index.d.ts` with all declarations

## Usage

```bash
bun run generate
```

Or from the monorepo root:

```bash
bun run generate
```

Both run:

```bash
bun src/index.ts <slua_yaml> <lsl_yaml> [output_path]
```

Output defaults to `packages/types/index.d.ts`.

## Tests

```bash
bun test
```
