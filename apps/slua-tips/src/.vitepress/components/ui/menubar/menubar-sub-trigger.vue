<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/utilities/cn'
import { reactiveOmit } from '@vueuse/core'
import { Icon } from '@iconify/vue'
import { MenubarSubTrigger, type MenubarSubTriggerProps, useForwardProps } from 'reka-ui'

const props = defineProps<MenubarSubTriggerProps & { class?: HTMLAttributes['class'], inset?: boolean }>()

const delegatedProps = reactiveOmit(props, 'class', 'inset')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <MenubarSubTrigger
    data-slot="menubar-sub-trigger"
    :data-inset="inset ? '' : undefined"
    v-bind="forwardedProps"
    :class="cn(
      'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8',
      props.class,
    )"
  >
    <slot />
    <Icon icon="lucide:chevron-right" class="ml-auto size-4" />
  </MenubarSubTrigger>
</template>
