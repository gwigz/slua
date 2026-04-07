---
"@gwigz/slua-types": minor
"@gwigz/slua-tstl-plugin": minor
---

BREAKING: prefix plugin globals with `$` to avoid collisions with user code (`setPrimParams` → `$setPrimParams`, `castRay` → `$castRay`, etc.)
