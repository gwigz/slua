<template>
	<div class="flex flex-col gap-4 rounded-lg">
		<!-- editor -->
		<div class="flex-1 grid grid-cols-3 md:grid-cols-4 gap-4">
			<div class="col-span-3">
				<MonacoEditor v-model="code" language="luau" :error-lines="lastError !== undefined ? [lastError] : []"
					:storage-key="props.storageKey" />
			</div>

			<div class="col-span-3 md:col-span-1">
				<Cube :scale="cubeScale" :color="cubeColor" :glow="cubeGlow" />
			</div>
		</div>

		<!-- toolbar -->
		<div class="flex justify-between mb-4">
			<button @click="showResetModal = true" class="d-btn">
				Reset Script Content
			</button>

			<div class="flex gap-2">
				<template v-if="script">
					<button @click="script?.touch()" class="d-btn d-btn-primary">
						Touch
					</button>

					<button @click="script?.collision()" class="d-btn d-btn-primary">
						Collide
					</button>
				</template>

				<button @click="runScript()" :class="['d-btn', script ? 'd-btn-secondary' : 'd-btn-primary']">
					<template v-if="script">
						<Icon icon="solar:restart-bold" class="text-2xl" />
					</template>
					<template v-else>
						Run
					</template>
				</button>
			</div>
		</div>

		<!-- reset confirmation modal -->
		<dialog ref="resetModal" class="d-modal" :open="showResetModal">
			<div class="d-modal-box">
				<h3 class="font-bold text-lg">Reset Script Content</h3>
				<p class="py-4 text-sm">
					Are you sure you want to reset the script content? This will restore
					the original code and clear the output.
				</p>
				<div class="d-modal-action">
					<form class="flex gap-2" method="dialog">
						<button @click="showResetModal = false" class="d-btn d-btn-ghost">
							Cancel
						</button>
						<button @click="confirmReset" class="d-btn d-btn-primary">
							Reset
						</button>
					</form>
				</div>
			</div>
			<form method="dialog" class="d-modal-backdrop">
				<button class="!cursor-default" @click="showResetModal = false">
					Close
				</button>
			</form>
		</dialog>

		<!-- output -->
		<div class="bg-card border rounded overflow-hidden relative">
			<div class="p-4 h-[128px] overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap" ref="outputRef"
				@scroll="handleScroll">
				<div v-if="output.length > 0">
					<template v-for="line in output" :key="`${line.delta}${Math.random()}`">
						<div>
							<span class="text-muted-foreground">[{{ new Date(line.timestamp * 1000).toLocaleTimeString() }}]
							</span>
							<span class="text-primary">{{ line.name.trim()
							}}{{
									line.data.startsWith('/me ') || line.data.startsWith("/me'")
										? ''
										: ': '
								}}</span><span>{{ line.data.replace(/^\/me('|\s)/, '$1').trim() }}</span>
						</div>
					</template>
				</div>

				<div v-else class="text-gray-500 italic">No output yet</div>
			</div>

			<button v-if="showScrollButton" @click="
				autoScroll = true;
			showScrollButton = false;

			nextTick(() => outputRef?.scrollTo(0, outputRef.scrollHeight));
			" class="absolute bottom-2 right-2 px-1 py-1 bg-primary/80 text-white rounded hover:bg-primary transition-colors text-sm flex items-center gap-1">
				<Icon icon="solar:arrow-down-bold" class="text-lg" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import slua, { type SLuaOutput, type SLuaScript } from '@gwigz/slua-web';
import { Icon } from '@iconify/vue';
import { inBrowser } from 'vitepress';
import {
	defineAsyncComponent,
	nextTick,
	onMounted,
	reactive,
	ref,
	useSlots,
	watchEffect,
} from 'vue';
import Cube from './cube.vue';

const MonacoEditor = inBrowser
	? defineAsyncComponent(() => import('./monaco-editor.vue'))
	: () => null;

const props = defineProps<{ storageKey?: string }>();
const slots = useSlots();

const code = ref(getCodeFromSlot());

const script = ref<SLuaScript | null>(null);

const output = reactive<SLuaOutput[]>([]);
const outputRef = ref<HTMLElement | null>(null);

const autoScroll = ref(true);
const showScrollButton = ref(false);
const lastScrollHeight = ref(0);

const cubeScale = ref<[number, number, number]>([0.5, 0.5, 0.5]);
const cubeColor = ref('#ffffff');
const cubeGlow = ref(0);

function rgbToHex(rgb: [number, number, number]): string {
	const [r, g, b] = rgb.map((v) => Math.round(v * 255));

	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getSlotTextContent(children) {
	return children
		.map((node) => {
			if (typeof node.children === 'string') return node.children;

			if (Array.isArray(node.children))
				return getSlotTextContent(node.children);

			return '';
		})
		.join('');
}

function getCodeFromSlot() {
	return getSlotTextContent(slots?.default?.()?.[0].children)
		.replace(/^luau/, '')
		.concat('\n');
}

// auto-scrolling
watchEffect(() => {
	if (output.length > 0 && outputRef.value && autoScroll.value) {
		nextTick(() => {
			const element = outputRef.value;

			if (element) {
				element.scrollTop = element.scrollHeight;
				lastScrollHeight.value = element.scrollHeight;
			}
		});
	} else if (output.length > 0 && outputRef.value && !autoScroll.value) {
		const element = outputRef.value;

		if (element) {
			const currentHeight = element.scrollHeight;

			if (currentHeight > lastScrollHeight.value) {
				lastScrollHeight.value = currentHeight;
			}
		}
	}
});

// scroll detection
const handleScroll = () => {
	if (!outputRef.value) return;

	const element = outputRef.value;

	const isAtBottom =
		element.scrollHeight - element.scrollTop <= element.clientHeight + 10;

	if (isAtBottom) {
		autoScroll.value = true;
		showScrollButton.value = false;
	} else if (autoScroll.value) {
		autoScroll.value = false;
	}
};

// scroll button
watchEffect(() => {
	if (output.length > 0 && !autoScroll.value) {
		showScrollButton.value = true;
	}
});

const lastError = ref<number | undefined>(undefined);

onMounted(async () => {
	if (inBrowser && props.storageKey) {
		const savedCode = localStorage.getItem(props.storageKey);

		if (savedCode) {
			code.value = savedCode;
		}
	}
});

async function runScript() {
	if (script.value) {
		script.value.dispose();
	}

	cubeScale.value = [1, 1, 1];
	cubeColor.value = '#ffffff';
	lastError.value = undefined;
	script.value = null;

	output.splice(0, output.length);

	const result = await slua.runScript(code.value, {
		onChat: (message) => {
			output.push(message);
		},
		onScaleChange: (link, scale) => {
			if (link === 1) {
				cubeScale.value = [scale[0], scale[1], scale[2]];
			}
		},
		onColorChange: (link, color) => {
			if (link === 1) {
				cubeColor.value = rgbToHex(color);
			}
		},
		onGlowChange: (link, glow) => {
			if (link === 1) {
				cubeGlow.value = glow;
			}
		},
	});

	if (result.errors.length) {
		lastError.value = result.errors[0].line;

		output.push(...result.errors);
		console.error(result.errors);
	} else {
		script.value = result.script;
	}
}

const resetModal = ref<HTMLDialogElement | null>(null);
const showResetModal = ref(false);

function confirmReset() {
	const newCode = getCodeFromSlot();

	output.splice(0, output.length);

	lastError.value = undefined;
	script.value = null;
	code.value = '';

	cubeScale.value = [1, 1, 1];
	cubeColor.value = '#ffffff';

	showResetModal.value = false;

	nextTick(() => {
		code.value = newCode;
	});
}
</script>
