---
"@gwigz/slua-viewer-client": patch
---

concurrent deploys no longer collide in lock-step on a stale listing, since the retry backoff is now jittered
