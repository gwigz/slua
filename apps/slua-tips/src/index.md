---
layout: page
sidebar: false
---

<script setup>
import Home from './.vitepress/components/home.vue'
</script>

<Home>

<template v-slot:hello-world>

```luau
local sluri = require('sluri')

function touch_end()
  ll.OwnerSay(`{sluri.inspect(id)} touched me... :3`)
end

ll.OwnerSay("Hey there!")
```

</template>

</Home>
