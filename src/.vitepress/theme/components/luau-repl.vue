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
						@click="runCode"
						class="px-4 py-2 bg-primary/80 text-white rounded hover:bg-primary transition-colors"
					>
						Run
					</button>
				</div>
			</div>

			<div class="bg-card border rounded overflow-hidden">
				<div
					class="p-4 min-h-[100px] font-mono text-sm leading-relaxed whitespace-pre-wrap"
					ref="outputRef"
				>
					<pre v-if="output">{{ output }}</pre>
					<div v-else class="text-gray-500 italic">No output yet</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inBrowser } from "vitepress";
import { computed, defineAsyncComponent, onMounted, ref } from "vue";

const MonacoEditor = inBrowser
	? defineAsyncComponent(() => import("./monaco-editor.vue"))
	: () => null;

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

const code = ref('ll.OwnerSay("Hello, world!")');
const output = ref("");
const outputRef = ref<HTMLElement | null>(null);
const lastError = ref<number | undefined>(undefined);

onMounted(() => {
	if (inBrowser && typeof window.Module === "undefined") {
		window.Module = {
			print: (msg: string) => {
				output.value = `${output.value}${msg}\n`;
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

const sandbox = `
ll = {
	OwnerSay = function(msg)
		print(msg)
	end
}
`;

const sandboxLineCount = computed(() => sandbox.split("\n").length);

const runCode = async () => {
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

		const err = window.Module.ccall(
			"executeScript",
			"string",
			["string"],
			[`${sandbox}\n${code.value}`]
		);

		if (err) {
			const errText = err.replace("stdin:", "");
			const errLineNo = Number(errText.match(/\d+/)?.[0]);

			if (errLineNo) {
				lastError.value = Number(errLineNo) - sandboxLineCount.value;

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
