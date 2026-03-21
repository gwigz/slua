# Contributing

## Setup

```sh
bun install
```

Submodules (for type generation) are pulled automatically. If you cloned without `--recurse-submodules`:

```sh
git submodule update --init
```

## Releasing

This repo uses [Changesets](https://github.com/changesets/changesets) to manage versioning and publishing of `@gwigz/slua-types` and `@gwigz/slua-tstl-plugin`.

Both packages are **version-locked**, they always share the same version number. When either package changes, both are bumped together.

### Adding a changeset

When your PR includes changes to either published package, add a changeset:

```sh
bun changeset
```

This will prompt you to:

1. Select which packages changed (both will be bumped regardless due to the `fixed` config)
2. Choose a bump type (patch / minor / major)
3. Write a summary of the change

A markdown file is created in `.changeset/`, commit it with your PR.

### How releases happen

1. Push or merge to `main`
2. The **Release** workflow detects pending changesets and opens a "Version Packages" PR
3. That PR updates `package.json` versions and `CHANGELOG.md` files
4. Merging the "Version Packages" PR triggers `npm publish` for both packages

### CI

Every PR and push to `main` runs the **CI** workflow:

- Format check (`oxfmt --check`)
- Lint (`oxlint`)
- Type generation
- Build
- Tests
