<template>
	<div
		class="flex flex-col gap-12 max-w-sm w-full bg-card/80 rounded-lg p-4 border-muted backdrop-blur-md border"
	>
		<slot />

		<div class="flex flex-col gap-4">
			<div class="grid grid-cols-3 gap-x-5 gap-y-3">
				<template v-for="button in props.buttons" :key="button">
					<Button @click="emit('close', button)" size="sm">
						{{ button }}
					</Button>
				</template>
			</div>

			<div class="flex justify-end">
				<Button @click="emit('close')" size="compact">Ignore</Button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Button } from "~/components/ui/button";

const props = defineProps<{ buttons: string[] }>();
const emit = defineEmits<{ close: [string?] }>();
</script>
