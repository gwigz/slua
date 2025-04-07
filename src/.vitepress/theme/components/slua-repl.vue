<template>
	<div class="flex flex-col gap-4 rounded-lg">
		<div class="flex flex-col gap-2">
			<div class="flex-1">
				<MonacoEditor
					v-model="code"
					language="luau"
					class="w-full min-h-[200px]"
					:error-lines="lastError !== undefined ? [lastError] : []"
				/>
			</div>

			<div class="flex justify-end mb-4">
				<div class="flex gap-2">
					<button
						@click="runCode()"
						class="px-4 py-2 bg-primary/80 text-white rounded hover:bg-primary transition-colors"
					>
						Run
					</button>
					<button
						@click="runCode('touch')"
						class="px-4 py-2 bg-primary/80 text-white rounded hover:bg-primary transition-colors"
					>
						Touch
					</button>
				</div>
			</div>

			<div class="bg-card border rounded overflow-hidden">
				<div
					class="p-4 min-h-[100px] font-mono text-sm leading-relaxed whitespace-pre-wrap"
					ref="outputRef"
				>
					<div v-if="output.length > 0">
						<template v-for="line in output" :key="line.d">
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
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inBrowser } from "vitepress";
import { computed, defineAsyncComponent, onMounted, ref, useSlots } from "vue";

import sandboxContent from "./slua-sandbox.luau?raw";

const MonacoEditor = inBrowser
	? defineAsyncComponent(() => import("./monaco-editor.vue"))
	: () => null;

const slots = useSlots();

declare global {
	interface Window {
		Module: {
			ccall: (
				func: string,
				returnType: string,
				argTypes: string[],
				args: (string | number | boolean)[]
			) => string;

			print: (msg: string) => void;
		};
	}
}

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
	return getSlotTextContent(slots.default()?.[0].children)
		.replace(/^luau/, "")
		.concat("\n");
}

const code = ref(getCodeFromSlot());

type Output = {
	type: number;
	ts: number;
	d: number;
	name: string;
	msg: string;
};

const output = ref<Output[]>([]);
const outputRef = ref<HTMLElement | null>(null);

const lastError = ref<number | undefined>(undefined);

onMounted(() => {
	if (inBrowser && typeof window.Module === "undefined") {
		window.Module = {
			print: (message: string) => {
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
			},
			ccall: () => {
				throw new Error("Luau runtime not loaded yet");
			},
		};

		const script = document.createElement("script");

		script.src = "/assets/js/luau-web.js";
		script.async = true;

		document.head.appendChild(script);
	}
});

const sandboxLineCount = computed(() => sandbox.split("\n").length);

const runCode = async (method?: "touch") => {
	try {
		if (
			!inBrowser ||
			typeof window.Module === "undefined" ||
			!window.Module.ccall
		) {
			output.value = "Luau runtime not loaded yet, please wait...";
			return;
		}

		if (lastError.value !== undefined) {
			lastError.value = undefined;
		}

		output.value = "";

		let suffix = "";

		if (method === "touch") {
			suffix = `
if type(touch_start) == 'function' then touch_start() end
if type(touch) == 'function' then touch() end
if type(touch_end) == 'function' then touch_end() end
`;
		}

		const err = window.Module.ccall(
			"executeScript",
			"string",
			["string"],
			[`${sandbox}\n(function ()\n${code.value}\nend)()\n${suffix}`]
		);

		if (err) {
			const errText = err.replace("stdin:", "");
			const errLineNo = Number(errText.match(/\d+/)?.[0]);

			if (errLineNo) {
				lastError.value = Number(errLineNo) - (sandboxLineCount.value + 1);

				output.value = `Error: ${errText.replace(/\d+/, `${lastError.value}`)}`;
			} else {
				output.value = `Error: ${errText}`;
			}
		}
	} catch (error) {
		output.value = `Error: ${
			error instanceof Error ? error.message : String(error)
		}`;
	}
};
</script>
