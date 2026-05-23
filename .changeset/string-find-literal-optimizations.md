---
"@gwigz/slua-tstl-plugin": minor
---

optimized string transforms for literal needles:

- drop the `1, true` plain-text args from `string.find` (`indexOf`/`includes`/`startsWith`) when the needle is a magic-free string literal (#69)
- compile `startsWith`/`endsWith` with a literal needle to a `string.sub` comparison, empty literal folds to `true` (#68)
