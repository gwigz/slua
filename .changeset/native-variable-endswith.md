---
"@gwigz/slua-tstl-plugin": patch
---

transpile variable `str.endsWith(x)` to a native suffix compare instead of the `__TS__StringEndsWith` lualib helper
