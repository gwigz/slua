<template>
	<div class="flex flex-col gap-4">
		<!-- toolbar -->
		<div
			class="flex order-1 md:order-none flex-col md:flex-row gap-3 bg-card border-12 md:border-8 border-card outline-1 outline-muted rounded-lg justify-between md:items-center"
		>
			<div class="flex flex-1">
				<AlertDialog v-model:open="showResetModal">
					<AlertDialogTrigger as-child>
						<Button class="flex-1 md:flex-none" variant="secondary" size="xs">Reset Script Content</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will remove any changes you've
								made to the script and clear the output.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction @click="confirmReset"
								>Reset Script Content</AlertDialogAction
							>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			<div
				class="flex flex-1 justify-center text-muted-foreground text-xs divide-x -order-1 md:order-none"
			>
				<template v-if="script">
					<div class="pr-3">script running</div>
				</template>
				<template v-else>
					<div class="pr-3">script stopped</div>
				</template>

				<template v-if="timerInterval === 0">
					<div class="pl-3">timer stopped</div>
				</template>
				<template v-else>
					<div class="pl-3">{{ timerInterval }} timer interval</div>
				</template>
			</div>

			<div
				class="flex flex-1 justify-end [&_button]:flex-1 md:[&_button]:flex-none gap-2"
			>
				<template v-if="script">
					<Button @click="script.touch(1)" variant="default" size="xs">
						Touch
					</Button>

					<Button @click="script.collision(1)" variant="default" size="xs">
						Collide
					</Button>
				</template>

				<Button
					@click="runScript()"
					:variant="script ? 'secondary' : 'default'"
					size="xs"
				>
					<template v-if="script">
						<Icon icon="solar:restart-bold" class="text-2xl" />
						Reset
					</template>
					<template v-else>Run</template>
				</Button>
			</div>
		</div>

		<ResizablePanelGroup
			direction="horizontal"
			class="flex-1 rounded-lg bg-muted/20 border-8 border-card outline-1 outline-muted"
		>
			<ResizablePanel
				:default-size="62.5"
				class="bg-muted/20 outline-1 outline-muted"
			>
				<MonacoEditor
					v-model="code"
					language="luau"
					:error-lines="lastError !== undefined ? [lastError] : []"
					:storage-key="props.storageKey"
				/>
			</ResizablePanel>

			<ResizableHandle with-handle />

			<ResizablePanel>
				<ResizablePanelGroup direction="vertical">
					<ResizablePanel
						:default-size="50"
						class="bg-muted/20 outline outline-muted w-full h-full"
					>
						<!-- cube -->
						<Cube
							:scale="cubeScale"
							:color="cubeColor"
							:glow="cubeGlow"
							:died="cubeDied"
							@click="() => script?.touch(1)"
						/>
					</ResizablePanel>

					<ResizableHandle with-handle />

					<ResizablePanel class="bg-card/40 relative">
						<!-- output -->
						<div
							class="p-4 overflow-y-auto h-full font-mono text-sm leading-relaxed whitespace-pre-wrap"
							ref="outputRef"
							@scroll="handleScroll"
						>
							<!-- TODO: infinite scroll component -->
							<div v-if="output.length > 0">
								<template
									v-for="line in output"
									:key="`${line.delta}${Math.random()}`"
								>
									<div>
										<span class="text-muted-foreground"
											>[{{
												new Date(line.timestamp * 1000).toLocaleTimeString()
											}}]
										</span>
										<span class="text-primary"
											>{{ line.name.trim()
											}}{{
												line.data.startsWith("/me ") ||
												line.data.startsWith("/me'")
													? ""
													: ": "
											}}</span
										><span :class="getChatClass(line.type)">{{
											line.data.replace(/^\/me('|\s)/, "$1").trim()
										}}</span>
									</div>
								</template>
							</div>

							<div v-else class="text-gray-500 italic">No output yet</div>
						</div>

						<!-- scroll to bottom button -->
						<button
							v-if="showScrollButton"
							@click="scrollToBottom"
							class="absolute bottom-2 right-2 px-1 py-1 bg-primary/80 text-white rounded hover:bg-primary transition-colors text-sm flex items-center gap-1"
						>
							<Icon icon="solar:arrow-down-bold" class="text-lg" />
						</button>
					</ResizablePanel>
				</ResizablePanelGroup>
			</ResizablePanel>
		</ResizablePanelGroup>
	</div>
</template>

<script setup lang="ts">
import slua, {
	ChatType,
	type SLuaOutput,
	type SLuaScript,
} from "@gwigz/slua-web";
import { Icon } from "@iconify/vue";
import { inBrowser } from "vitepress";
import {
	defineAsyncComponent,
	nextTick,
	onMounted,
	reactive,
	ref,
	useSlots,
	watchEffect,
} from "vue";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "~/components/ui/resizable";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { cn } from "~/utilities/cn";
import Cube from "./cube.vue";

const MonacoEditor = inBrowser
	? defineAsyncComponent(() => import("./monaco-editor.vue"))
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
const cubeColor = ref("#ffffff");
const cubeGlow = ref(0);
const cubeDied = ref(false);

const timerInterval = ref(0);

function rgbToHex(rgb: [number, number, number]): string {
	const [r, g, b] = rgb.map((v) => Math.round(v * 255));

	return `#${r.toString(16).padStart(2, "0")}${g
		.toString(16)
		.padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function getChatClass(type: ChatType) {
	return cn(
		type === ChatType.WHISPER && "italic",
		type === ChatType.SHOUT && "font-semibold",
		type === ChatType.OWNER && "text-yellow-950 dark:text-yellow-100",
		type === ChatType.INSTANT_MESSAGE && "text-blue-900 dark:text-blue-200",
		type === ChatType.DEBUG && "text-red-900 dark:text-red-200"
	);
}

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

function stopScript() {
	script.value?.dispose();
	script.value = null;

	cubeScale.value = [0.5, 0.5, 0.5];
	cubeColor.value = "#ffffff";
	cubeDied.value = false;

	lastError.value = undefined;

	timerInterval.value = 0;
}

async function runScript() {
	stopScript();

	const result = await slua.runScript(code.value, {
		onError: (error) => {
			output.push(error);

			// script will continue in some scenarios, so we want to stop it here
			stopScript();
		},
		onStop: () => {
			stopScript();
		},
		onDie: () => {
			stopScript();

			cubeDied.value = true;
		},
		onReset: () => {
			stopScript();
			runScript();
		},
		onChat: (message) => {
			// TODO: limit output to 1000 lines?
			output.push(message);
		},
		onTimerChange: (interval) => {
			timerInterval.value = interval;
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

	script.value = result || null;
}

const showResetModal = ref(false);

function confirmReset() {
	const newCode = getCodeFromSlot();

	stopScript(true);

	lastError.value = undefined;

	code.value = "";

	nextTick(() => {
		code.value = newCode;
	});
}

function scrollToBottom() {
	autoScroll.value = true;
	showScrollButton.value = false;

	nextTick(() => outputRef.value?.scrollTo(0, outputRef.value.scrollHeight));
}
</script>
