# @gwigz/slua-viewer-client

## 0.2.0

### Minor Changes

- [#124](https://github.com/gwigz/slua/pull/124) [`a19a38c`](https://github.com/gwigz/slua/commit/a19a38cdc254905e644bce958c6f2900aa8a4e42) Thanks [@gwigz](https://github.com/gwigz)! - `push` now prints the output its own save produced, with `--tail` to keep listening and `--no-tail` to opt out

- [#124](https://github.com/gwigz/slua/pull/124) [`a19a38c`](https://github.com/gwigz/slua/commit/a19a38cdc254905e644bce958c6f2900aa8a4e42) Thanks [@gwigz](https://github.com/gwigz)! - `connect` holds one viewer session that watches, pushes and streams output in one terminal, reachable by agents over a control socket, an mcp server and `.slua/logs.jsonl`

## 0.1.0

### Minor Changes

- [#121](https://github.com/gwigz/slua/pull/121) [`acc797b`](https://github.com/gwigz/slua/commit/acc797ba80ea2134bd4ee8e84c1276df8bd54916) Thanks [@gwigz](https://github.com/gwigz)! - cli and typed client for the viewer's external script editor, mapping compile and runtime errors back to typescript, with `--wait` for the viewer's publish button
