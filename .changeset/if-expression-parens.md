---
"@gwigz/slua-tstl-plugin": patch
---

parenthesize `if` expressions used as operands, callees, or indexed tables, so `(ok ? 1 : 2) + n` no longer compiles to `if ok then 1 else 2 + n`
