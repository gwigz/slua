# @gwigz/slua-modules

## 0.6.0

### Minor Changes

- [#106](https://github.com/gwigz/slua/pull/106) [`badc8c6`](https://github.com/gwigz/slua/commit/badc8c6b8691cc6c071682836997ae4558bd7b27) Thanks [@gwigz](https://github.com/gwigz)! - vendoring cli, `add <module>` copies module source into your project

### Patch Changes

- [#109](https://github.com/gwigz/slua/pull/109) [`7e4d9de`](https://github.com/gwigz/slua/commit/7e4d9de96ac6b06747f7917a0d81d2442d996e7c) Thanks [@gwigz](https://github.com/gwigz)! - exclude test files from the published tarball

- [#109](https://github.com/gwigz/slua/pull/109) [`7e4d9de`](https://github.com/gwigz/slua/commit/7e4d9de96ac6b06747f7917a0d81d2442d996e7c) Thanks [@gwigz](https://github.com/gwigz)! - fix vendored yield builds, `fetch` now builds the `ll.HTTPRequest` parameter list at runtime instead of relying on the `$httpRequest` inline transform

- Updated dependencies [[`0e5436f`](https://github.com/gwigz/slua/commit/0e5436f91d911530e52c69621755ab16e5e212e5)]:
  - @gwigz/slua-types@1.5.0

## 0.5.0

### Minor Changes

- [`be8cebb`](https://github.com/gwigz/slua/commit/be8cebbf9c40bb98725fdfc7e2eddbf6c8c03eb7) Thanks [@gwigz](https://github.com/gwigz)! - add utilities module with debounce, throttle, and cooldown

### Patch Changes

- [`3ce1aa6`](https://github.com/gwigz/slua/commit/3ce1aa64b76bbea025cce9e37a3dfb71c865ca2c) Thanks [@gwigz](https://github.com/gwigz)! - use sync notecard reading in yield module with async fallback on cache miss

- Updated dependencies [[`6225982`](https://github.com/gwigz/slua/commit/6225982123548d13b5e92ffacc5f339bf1b6299d), [`b09c9b3`](https://github.com/gwigz/slua/commit/b09c9b3eeb0c8d65bdd97045394d30574c34907e)]:
  - @gwigz/slua-types@1.4.1

## 0.4.0

### Minor Changes

- [`9c932fa`](https://github.com/gwigz/slua/commit/9c932fa8948c3bf28a7ef8c39a2c9daebefa86dd) Thanks [@gwigz](https://github.com/gwigz)! - rename yield `httpRequest` to `fetch` with options object matching the plugin's `httpRequest` global

### Patch Changes

- Updated dependencies [[`f1decd2`](https://github.com/gwigz/slua/commit/f1decd288d7f3128b1e7ff0f66f7cda77ef8adae), [`6d9a857`](https://github.com/gwigz/slua/commit/6d9a8570901c7c2ec4cb27fa7069bcd660ea66e1), [`02eb635`](https://github.com/gwigz/slua/commit/02eb635b9e7e595826f3ff5f7cefad42443405cb), [`19fbb83`](https://github.com/gwigz/slua/commit/19fbb838ac5ab39353f0f144f05c8dc50627916c), [`bf54421`](https://github.com/gwigz/slua/commit/bf54421d2e299c6e8144f46e9614cfc0d118739d), [`7ecee67`](https://github.com/gwigz/slua/commit/7ecee67d1d9cc3721cd88034f6fd659917256e03)]:
  - @gwigz/slua-types@1.4.0

## 0.3.1

### Patch Changes

- [`491e4c5`](https://github.com/gwigz/slua/commit/491e4c546629de8b5894bbf9a39d1ac9ae274a0a) Thanks [@gwigz](https://github.com/gwigz)! - fix `workspace:^` dependency on `@gwigz/slua-types`

## 0.3.0

### Minor Changes

- [`2eb2b30`](https://github.com/gwigz/slua/commit/2eb2b302bee6a4619900cec6a21b253b997145bd) Thanks [@gwigz](https://github.com/gwigz)! - `yield` module with coroutine-based wrappers

### Patch Changes

- Updated dependencies [[`0870221`](https://github.com/gwigz/slua/commit/087022161caf9a5bf74728a4b0dfdebfd140cc4d)]:
  - @gwigz/slua-types@1.1.1

## 0.2.0

### Minor Changes

- [`c8d8b88`](https://github.com/gwigz/slua/commit/c8d8b88b752927587385190836294330ed130650) Thanks [@gwigz](https://github.com/gwigz)! - rework config API to use `{ config, type? }` options with optional lljson support
