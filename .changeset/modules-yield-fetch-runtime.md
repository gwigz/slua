---
"@gwigz/slua-modules": patch
---

fix vendored yield builds, `fetch` now builds the `ll.HTTPRequest` parameter list at runtime instead of relying on the `$httpRequest` inline transform
