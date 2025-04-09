<script setup lang="ts">
import { Icon } from '@iconify/vue';

const props = withDefaults(
	defineProps<{
		name: string;
		title: string;
		description: string;
	}>(),
	{
		title: '',
		description: '',
	},
);
</script>

<template>
	<a
		:href="`/resources/${props.name}`"
		class="!no-underline block p-4 border border-border rounded-lg bg-card hover:bg-primary/5 hover:border-primary/30 transition-colors"
		><div class="flex justify-between items-center">
			<div class="">
				<div class="font-medium text-primary">
					{{ props.title }}
				</div>
				<div class="text-sm text-muted-foreground">
					{{ props.description }}
				</div>
			</div>
			<Icon
				icon="solar:arrow-right-up-linear"
				class="h-6 w-6 text-primary"
			/></div
	></a>
</template>
