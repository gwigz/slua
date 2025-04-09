<template>
	<div class="flex flex-col gap-4 rounded-lg">
		<!-- editor -->
		<div class="flex-1 grid grid-cols-3 md:grid-cols-4 gap-4">
			<div class="col-span-3">
				<MonacoEditor
					v-model="code"
					language="luau"
					:error-lines="lastError !== undefined ? [lastError] : []"
					:storage-key="props.storageKey"
				/>
			</div>

			<div class="col-span-3 md:col-span-1">
				<Cube />
			</div>
		</div>

		<!-- toolbar -->
		<div class="flex justify-between mb-4">
			<button @click="showResetModal = true" class="d-btn">
				Reset Script Content
			</button>

			<div class="flex gap-2">
				<button @click="runCode()" class="d-btn d-btn-primary">Run</button>
				<button @click="runCode('touch')" class="d-btn d-btn-primary">
					Touch
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
					close
				</button>
			</form>
		</dialog>

		<!-- output -->
		<div class="bg-card border rounded overflow-hidden relative">
			<div
				class="p-4 h-[128px] overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap"
				ref="outputRef"
				@scroll="handleScroll"
			>
				<div v-if="output.length > 0">
					<template v-for="line in output" :key="`${line.d}${Math.random()}`">
						<div>
							<span class="text-muted-foreground"
								>[{{ new Date(line.ts * 1000).toLocaleTimeString() }}]
							</span>
							<span class="text-primary"
								>{{ line.name.trim()
								}}{{
									line.msg.startsWith("/me ") || line.msg.startsWith("/me'")
										? ""
										: ": "
								}}</span
							><span>{{ line.msg.replace(/^\/me('|\s)/, "$1").trim() }}</span>
						</div>
					</template>
				</div>

				<div v-else class="text-gray-500 italic">No output yet</div>
			</div>

			<button
				v-if="showScrollButton"
				@click="
					autoScroll = true;
					showScrollButton = false;

					nextTick(() => outputRef?.scrollTo(0, outputRef.scrollHeight));
				"
				class="absolute bottom-2 right-2 px-1 py-1 bg-primary/80 text-white rounded hover:bg-primary transition-colors text-sm flex items-center gap-1"
			>
				<Icon icon="solar:arrow-down-bold" class="text-lg" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import initLuau, { type MainModule as Luau } from "../luau/luau-web";
import Cube from "./cube.vue";

import { inBrowser } from "vitepress";
import {
	computed,
	defineAsyncComponent,
	nextTick,
	onMounted,
	ref,
	useSlots,
	watchEffect,
} from "vue";

// @ts-expect-error idk, adding .d.ts for *.luau/*.luau?raw doesn't help
import sandboxContent from "./slua-sandbox.luau?raw";

const MonacoEditor = inBrowser
	? defineAsyncComponent(() => import("./monaco-editor.vue"))
	: () => null;

const slots = useSlots();
const code = ref(getCodeFromSlot());
const luau = ref<Luau | null>(null);

const props = defineProps<{
	storageKey?: string;
}>();

type Output = {
	type: number;
	ts: number;
	d: number;
	name: string;
	msg: string;
};

const output = ref<Output[]>([]);
const outputRef = ref<HTMLElement | null>(null);
const autoScroll = ref(true);
const showScrollButton = ref(false);
const lastScrollHeight = ref(0);

const sandbox = sandboxContent.replace(/internal/g, "__INTERNAL_DO_NOT_USE");

function getSlotTextContent(children) {
	return children
		.map((node) => {
			if (typeof node.children === "string") return node.children;

			if (Array.isArray(node.children))
				return getSlotTextContent(node.children);

			return "";
		})
		.join("");
}

function getCodeFromSlot() {
	return getSlotTextContent(slots?.default?.()?.[0].children)
		.replace(/^luau/, "")
		.concat("\n");
}

// auto-scrolling
watchEffect(() => {
	if (output.value && outputRef.value && autoScroll.value) {
		nextTick(() => {
			const element = outputRef.value;

			if (element) {
				element.scrollTop = element.scrollHeight;
				lastScrollHeight.value = element.scrollHeight;
			}
		});
	} else if (output.value && outputRef.value && !autoScroll.value) {
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
	if (output.value && !autoScroll.value) {
		showScrollButton.value = true;
	}
});

const lastError = ref<number | undefined>(undefined);

onMounted(async () => {
	if (inBrowser && !luau.value) {
		const printHandler = (message: string) => {
			if (!message.startsWith("#REPL#\t")) {
				return;
			}

			const [_, ts, d, type, name, msg] = message.split("\t");

			output.value = [
				...output.value,
				{
					ts: Number(ts),
					d: Number(d),
					type: Number(type),
					name,
					msg,
				},
			];
		};

		try {
			luau.value = await initLuau({
				print: printHandler,
			});
		} catch (error) {
			console.error("Failed to load Luau module:", error);
		}
	}
});

const sandboxLineCount = computed(() => sandbox.split("\n").length);

const runCode = async (method?: "touch") => {
	try {
		if (!inBrowser || !luau.value) {
			return;
		}

		lastError.value = undefined;
		output.value = [];

		let suffix = "";

		if (method === "touch") {
			suffix = "__INTERNAL_DO_NOT_USE.touch()\n";
		}

		const err = luau.value.ccall(
			"executeScript",
			"string",
			["string"],
			[`${sandbox}\n${code.value}\n${suffix}`]
		);

		if (err) {
			const errText = err.replace("stdin:", "");
			const errLineNo = Number(errText.match(/\d+/)?.[0]);

			if (errLineNo) {
				lastError.value = Number(errLineNo) - sandboxLineCount.value;

				// hack to work around our sandbox wrapper
				// may result in unexpected results if `error()` is used in their code?
				const adjustedErrText = errText
					// replace "X:" format
					.replace(/(\d+):/, `${Number(errLineNo) - sandboxLineCount.value}:`)
					// replace "at line X" format
					.replace(
						/at line (\d+)/,
						(_, line) => `at line ${Number(line) - sandboxLineCount.value}`
					)
					// replace "stack backtrace:\n\d+"
					.replace(
						/stack backtrace:\n(\d+)/g,
						(_, line) =>
							`stack backtrace:\n${Number(line) - sandboxLineCount.value}`
					)
					.replace(", got '__INTERNAL_DO_NOT_USE'", "")
					.replace(/__INTERNAL_DO_NOT_USE/g, "internal");

				output.value = [
					...output.value,
					{
						ts: Date.now(),
						d: Number.MAX_SAFE_INTEGER,
						type: 0,
						name: "Script Error",
						msg: adjustedErrText,
					},
				];
			} else {
				output.value = [
					...output.value,
					{
						ts: Date.now(),
						d: Number.MAX_SAFE_INTEGER,
						type: 0,
						name: "Script Error",
						msg: errText,
					},
				];
			}
		}
	} catch (error) {
		output.value = [
			...output.value,
			{
				ts: Date.now(),
				d: Number.MAX_SAFE_INTEGER,
				type: 0,
				name: "Script Error",
				msg: error instanceof Error ? error.message : String(error),
			},
		];
	}
};

const resetModal = ref<HTMLDialogElement | null>(null);
const showResetModal = ref(false);

const confirmReset = () => {
	const newCode = getCodeFromSlot();
	code.value = newCode;
	output.value = [];
	lastError.value = undefined;
	showResetModal.value = false;

	// force a re-render of the MonacoEditor by temporarily setting code to empty
	code.value = "";

	nextTick(() => {
		code.value = newCode;
	});
};
</script>
