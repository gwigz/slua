---
"@gwigz/slua-tstl-plugin": minor
---

add `tableClear` optimize flag to compile `arr.length = 0` to `table.clear(arr)` instead of the `__TS__ArraySetLength` lualib helper
