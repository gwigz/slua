---
"@gwigz/slua-tstl-plugin": minor
---

include `tableClear` in `optimize: true`, since `table.clear` keeps the same capacity as `__TS__ArraySetLength` without the helper
