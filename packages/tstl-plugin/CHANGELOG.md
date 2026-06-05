# @gwigz/slua-tstl-plugin

## 1.6.0

### Minor Changes

- [`0fa449d`](https://github.com/gwigz/slua/commit/0fa449d288f936d2f266b3177379257179cda260) Thanks [@gwigz](https://github.com/gwigz)! - add `simplifyNilChecks` optimize flag to rewrite `not (x ~= nil)` as `x == nil`

- [`2de3436`](https://github.com/gwigz/slua/commit/2de3436709e66565f5ba1622c34741c8e823949e) Thanks [@gwigz](https://github.com/gwigz)! - optimized string transforms for literal needles:
  - drop the `1, true` plain-text args from `string.find` (`indexOf`/`includes`/`startsWith`) when the needle is a magic-free string literal ([#69](https://github.com/gwigz/slua/issues/69))
  - compile `startsWith`/`endsWith` with a literal needle to a `string.sub` comparison, empty literal folds to `true` ([#68](https://github.com/gwigz/slua/issues/68))

### Patch Changes

- [`0b86fd0`](https://github.com/gwigz/slua/commit/0b86fd01cdb2c48d0dc5a0f2fa2eb97daa4a09f2) Thanks [@gwigz](https://github.com/gwigz)! - generate the minifier's reserved global-name set from the SLua definitions

- [`5869ca1`](https://github.com/gwigz/slua/commit/5869ca116ddc01d9139f6601f1298dadb7e18aa8) Thanks [@gwigz](https://github.com/gwigz)! - transpile variable `str.endsWith(x)` to a native suffix compare instead of the `__TS__StringEndsWith` lualib helper

- [`02ca356`](https://github.com/gwigz/slua/commit/02ca356b57b75c0b7b7696e79a791da74faf0ec1) Thanks [@gwigz](https://github.com/gwigz)! - extend `shortenTemps` to cover all plugin-generated `____<name>_<n>` temps, not just TSTL destructuring results

- Updated dependencies [[`6225982`](https://github.com/gwigz/slua/commit/6225982123548d13b5e92ffacc5f339bf1b6299d), [`b09c9b3`](https://github.com/gwigz/slua/commit/b09c9b3eeb0c8d65bdd97045394d30574c34907e)]:
  - @gwigz/slua-types@1.4.1

## 1.5.0

### Minor Changes

- [`f1decd2`](https://github.com/gwigz/slua/commit/f1decd288d7f3128b1e7ff0f66f7cda77ef8adae) Thanks [@gwigz](https://github.com/gwigz)! - add `setGltfOverrides` fluent builder for gltf material override parameter lists

- [`02eb635`](https://github.com/gwigz/slua/commit/02eb635b9e7e595826f3ff5f7cefad42443405cb) Thanks [@gwigz](https://github.com/gwigz)! - BREAKING: replace `castRay` and `httpRequest` fluent builders with options-object overloads that compile to flat parameter lists at build time, enabling use as expressions

- [`19fbb83`](https://github.com/gwigz/slua/commit/19fbb838ac5ab39353f0f144f05c8dc50627916c) Thanks [@gwigz](https://github.com/gwigz)! - BREAKING: prefix plugin globals with `$` to avoid collisions with user code (`setPrimParams` → `$setPrimParams`, `castRay` → `$castRay`, etc.)

- [`bf54421`](https://github.com/gwigz/slua/commit/bf54421d2e299c6e8144f46e9614cfc0d118739d) Thanks [@gwigz](https://github.com/gwigz)! - compile-time constant folding for bitwise expressions with inline comment annotation

### Patch Changes

- Updated dependencies [[`f1decd2`](https://github.com/gwigz/slua/commit/f1decd288d7f3128b1e7ff0f66f7cda77ef8adae), [`6d9a857`](https://github.com/gwigz/slua/commit/6d9a8570901c7c2ec4cb27fa7069bcd660ea66e1), [`02eb635`](https://github.com/gwigz/slua/commit/02eb635b9e7e595826f3ff5f7cefad42443405cb), [`19fbb83`](https://github.com/gwigz/slua/commit/19fbb838ac5ab39353f0f144f05c8dc50627916c), [`bf54421`](https://github.com/gwigz/slua/commit/bf54421d2e299c6e8144f46e9614cfc0d118739d), [`7ecee67`](https://github.com/gwigz/slua/commit/7ecee67d1d9cc3721cd88034f6fd659917256e03)]:
  - @gwigz/slua-types@1.4.0

## 1.4.0

### Minor Changes

- [`bf433d8`](https://github.com/gwigz/slua/commit/bf433d89df35c7dabedcc16613008b01c634398e) Thanks [@gwigz](https://github.com/gwigz)! - zero-cost fluent builder chains for prim, particle, camera, http, cast-ray, character, and rez parameter lists

### Patch Changes

- Updated dependencies [[`bf433d8`](https://github.com/gwigz/slua/commit/bf433d89df35c7dabedcc16613008b01c634398e)]:
  - @gwigz/slua-types@1.3.0

## 1.3.1

### Patch Changes

- [`491e4c5`](https://github.com/gwigz/slua/commit/491e4c546629de8b5894bbf9a39d1ac9ae274a0a) Thanks [@gwigz](https://github.com/gwigz)! - fix `workspace:^` dependency on `@gwigz/slua-types`

## 1.3.0

### Minor Changes

- [`5b1619b`](https://github.com/gwigz/slua/commit/5b1619b1ccccf8e6e3166a34882fc512e4463fea) Thanks [@gwigz](https://github.com/gwigz)! - add opt-in tree-shaking via `./shake` export

## 1.2.0

### Minor Changes

- [`c8d8b88`](https://github.com/gwigz/slua/commit/c8d8b88b752927587385190836294330ed130650) Thanks [@gwigz](https://github.com/gwigz)! - add compile-time `define` option with dead code elimination

## 1.1.0

### Minor Changes

- [`0fbecf9`](https://github.com/gwigz/slua/commit/0fbecf99e8ce448fee0b29a7a572ae6bc1ed2286) Thanks [@gwigz](https://github.com/gwigz)! - add `optimize` option with output optimization flags and new string transforms

## 1.0.0

### Patch Changes

- Updated dependencies [[`206ed57`](https://github.com/gwigz/slua/commit/206ed5781ef2708769e367e6efa4bf00587499e9)]:
  - @gwigz/slua-types@1.0.0
