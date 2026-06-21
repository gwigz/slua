# @gwigz/slua-types

## 1.4.3

### Patch Changes

- [`af56963`](https://github.com/gwigz/slua/commit/af569634b3a7f46da23fd04dc31946a0b31148b2) Thanks [@gwigz](https://github.com/gwigz)! - allow `""` on gltf prim-param overrides (base color, emissive, normal, metallic roughness) to clear/keep them

## 1.4.2

### Patch Changes

- [#83](https://github.com/gwigz/slua/pull/83) [`00d8c12`](https://github.com/gwigz/slua/commit/00d8c12322d2e239c5b94cf1d854a072bada1820) Thanks [@github-actions](https://github.com/apps/github-actions)! - Update SLua definitions submodule to latest upstream

- [`227c625`](https://github.com/gwigz/slua/commit/227c625155a8f57f204dcfddf2186f4d8bba91e6) Thanks [@gwigz](https://github.com/gwigz)! - emit upstream function overloads (fixes `os.time` return type)

## 1.4.1

### Patch Changes

- [#39](https://github.com/gwigz/slua/pull/39) [`6225982`](https://github.com/gwigz/slua/commit/6225982123548d13b5e92ffacc5f339bf1b6299d) Thanks [@github-actions](https://github.com/apps/github-actions)! - Update SLua definitions submodule to latest upstream

- [`b09c9b3`](https://github.com/gwigz/slua/commit/b09c9b3eeb0c8d65bdd97045394d30574c34907e) Thanks [@gwigz](https://github.com/gwigz)! - add wiki descriptions as jsdoc on typed-list constants (prim, http, camera, cast ray, etc.)

## 1.4.0

### Minor Changes

- [`f1decd2`](https://github.com/gwigz/slua/commit/f1decd288d7f3128b1e7ff0f66f7cda77ef8adae) Thanks [@gwigz](https://github.com/gwigz)! - add `setGltfOverrides` fluent builder for gltf material override parameter lists

- [`02eb635`](https://github.com/gwigz/slua/commit/02eb635b9e7e595826f3ff5f7cefad42443405cb) Thanks [@gwigz](https://github.com/gwigz)! - BREAKING: replace `castRay` and `httpRequest` fluent builders with options-object overloads that compile to flat parameter lists at build time, enabling use as expressions

- [`19fbb83`](https://github.com/gwigz/slua/commit/19fbb838ac5ab39353f0f144f05c8dc50627916c) Thanks [@gwigz](https://github.com/gwigz)! - BREAKING: prefix plugin globals with `$` to avoid collisions with user code (`setPrimParams` → `$setPrimParams`, `castRay` → `$castRay`, etc.)

- [`7ecee67`](https://github.com/gwigz/slua/commit/7ecee67d1d9cc3721cd88034f6fd659917256e03) Thanks [@gwigz](https://github.com/gwigz)! - typed return tuples for getter functions based on flags passed in (`GetObjectDetails`, `GetParcelDetails`, `GetPrimitiveParams`, `GetLinkPrimitiveParams`, `GetPrimMediaParams`, `GetLinkMedia`, `ParcelMediaQuery`, `GetEnvironment`), plus fixed tuples for `GetExperienceDetails`, `DetectedDamage`, `GetPhysicsMaterial`, `GetParcelPrimOwners`

### Patch Changes

- [#24](https://github.com/gwigz/slua/pull/24) [`6d9a857`](https://github.com/gwigz/slua/commit/6d9a8570901c7c2ec4cb27fa7069bcd660ea66e1) Thanks [@github-actions](https://github.com/apps/github-actions)! - Update SLua definitions submodule to latest upstream

- [`bf54421`](https://github.com/gwigz/slua/commit/bf54421d2e299c6e8144f46e9614cfc0d118739d) Thanks [@gwigz](https://github.com/gwigz)! - compile-time constant folding for bitwise expressions with inline comment annotation

## 1.3.0

### Minor Changes

- [`bf433d8`](https://github.com/gwigz/slua/commit/bf433d89df35c7dabedcc16613008b01c634398e) Thanks [@gwigz](https://github.com/gwigz)! - zero-cost fluent builder chains for prim, particle, camera, http, cast-ray, character, and rez parameter lists

## 1.2.0

### Minor Changes

- [`15b86b5`](https://github.com/gwigz/slua/commit/15b86b5c22d744a37302fd79dd983f96db7b0009) Thanks [@gwigz](https://github.com/gwigz)! - typed parameter lists for prim, http, particle, camera, cast-ray, character, rez, object-detail, and parcel-detail functions

## 1.1.2

### Patch Changes

- [`e2a2951`](https://github.com/gwigz/slua/commit/e2a2951667387bd9b3f72de602d4ab1ad0fb78a3) Thanks [@gwigz](https://github.com/gwigz)! - map bool-semantics to boolean types

## 1.1.1

### Patch Changes

- [#19](https://github.com/gwigz/slua/pull/19) [`0870221`](https://github.com/gwigz/slua/commit/087022161caf9a5bf74728a4b0dfdebfd140cc4d) Thanks [@github-actions](https://github.com/apps/github-actions)! - Update SLua definitions submodule to latest upstream

## 1.1.0

### Minor Changes

- [`a18e1f1`](https://github.com/gwigz/slua/commit/a18e1f14890fd0931dde4ca9b9346d41fd35b324) Thanks [@gwigz](https://github.com/gwigz)! - rename `vector`, `quaternion`, `uuid` type aliases to PascalCase (`Vector`, `Quaternion`, `UUID`)

### Patch Changes

- [#14](https://github.com/gwigz/slua/pull/14) [`1ac6263`](https://github.com/gwigz/slua/commit/1ac62630cd02cbc19851c3b08248f3b50ec556f4) Thanks [@github-actions](https://github.com/apps/github-actions)! - Update SLua definitions submodule to latest upstream

## 1.0.2

### Patch Changes

- [#11](https://github.com/gwigz/slua/pull/11) [`9f93192`](https://github.com/gwigz/slua/commit/9f931923f6b59e0216e4323331feecbd798be934) Thanks [@github-actions](https://github.com/apps/github-actions)! - Update SLua definitions submodule to latest upstream

- [`902b8fd`](https://github.com/gwigz/slua/commit/902b8fd6f845a62d233bf28b5f33928e457f1af6) Thanks [@gwigz](https://github.com/gwigz)! - fix missing deprecated tags

- [`4e9b96f`](https://github.com/gwigz/slua/commit/4e9b96fccbc7ddb327f5a85fe267e79ca169b2b3) Thanks [@gwigz](https://github.com/gwigz)! - camel-case adjustments

## 1.0.1

### Patch Changes

- [#8](https://github.com/gwigz/slua/pull/8) [`c14db3d`](https://github.com/gwigz/slua/commit/c14db3d02ef2559c1e488c16ed31e66086c451f3) Thanks [@github-actions](https://github.com/apps/github-actions)! - Update SLua definitions submodule to latest upstream

## 1.0.0

### Minor Changes

- [`206ed57`](https://github.com/gwigz/slua/commit/206ed5781ef2708769e367e6efa4bf00587499e9) Thanks [@gwigz](https://github.com/gwigz)! - fix `UUID` constants, using `slua-type` overrides
