---
"@gwigz/slua-tstl-plugin": patch
---

transpile multi-value and spread `arr.push()` statements to native `table.append`/`table.extend` instead of the `__TS__ArrayPush` lualib helper
