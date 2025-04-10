<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/utilities/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="alert-dialog-header"
    :class="cn('flex flex-col gap-2 sm:text-left', props.class)"
  >
    <slot />
  </div>
</template>
