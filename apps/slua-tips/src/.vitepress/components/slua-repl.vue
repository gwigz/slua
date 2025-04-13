<template>
	<div class="flex flex-col gap-4">
		<!-- toolbar -->
		<div
			class="flex order-1 md:order-none flex-col justify-between md:flex-row gap-3 bg-card border-12 md:border-8 border-card outline-1 outline-muted rounded-lg md:items-center"
		>
			<AlertDialog v-model:open="showResetModal">
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

			<div
				class="flex flex-1 text-muted-foreground text-xs justify-center divide-x -order-1 md:order-none"
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
				class="flex justify-end flex-wrap [&_button]:flex-1 md:[&_button]:flex-none gap-2"
			>
				<Button
					size="xs"
					:variant="script ? 'secondary' : 'default'"
					@click="script ? stopScript() : runScript()"
				>
					<template v-if="script">
						<Icon icon="solar:stop-bold" />
						Stop
					</template>
					<template v-else>
						<Icon icon="solar:play-bold" />
						Start
					</template>
				</Button>

				<template v-if="script">
					<Button
						class="relative"
						size="xs"
						variant="secondary"
						@click="
							stopScript();
							runScript();
						"
					>
						<div
							v-if="hasCodeChanged"
							class="absolute -top-0.5 -right-0.5 bg-primary text-xs size-2 rounded-full"
						/>
						<Icon icon="solar:refresh-bold" />
						Recompile
					</Button>

					<Button
						size="xs"
						variant="secondary"
						@click="
							stopScript();
							runScript();
						"
					>
						<Icon icon="solar:restart-bold" />
						Reset
					</Button>
				</template>

				<Button
					size="xs"
					variant="secondary"
					@click="output.splice(0, output.length)"
				>
					<Icon icon="solar:trash-bin-trash-bold" />
					Clear Log
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button size="xs" variant="secondary">
							More
							<Icon icon="solar:alt-arrow-down-outline" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" :alignOffset="0">
						<DropdownMenuItem disabled>
							<Icon icon="solar:download-minimalistic-outline" />
							Save
						</DropdownMenuItem>
						<DropdownMenuItem disabled>
							<Icon icon="solar:upload-minimalistic-outline" />
							Load
						</DropdownMenuItem>
						<DropdownMenuItem disabled>
							<Icon icon="solar:link-outline" />
							Share
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem @click="showResetModal = true">
							<Icon icon="solar:trash-bin-trash-bold" />
							Reset Content
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem disabled>
							<Icon icon="solar:settings-linear" />
							Settings
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>

		<ResizablePanelGroup
			direction="horizontal"
			class="flex-1 rounded-lg bg-muted/20 border-8 border-card outline-1 outline-muted"
		>
			<ResizablePanel
				:default-size="62.5"
				class="bg-muted/20 outline-1 outline-muted relative"
			>
				<div
					v-if="showWelcome"
					class="absolute m-2 md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 max-w-xl z-10 backdrop-blur-sm bg-background/50 px-6 py-4 border rounded-lg border-muted shadow"
				>
					<div class="flex flex-col gap-4 [&_p]:text-foreground/75">
						<div class="text-lg font-medium">Welcome to SLua Playground</div>

						<p>
							This interactive playground lets you experiment with SLua scripts
							in your browser.
						</p>
						<p>
							This project is still under development. You can check our
							<a
								class="underline hover:text-foreground"
								href="https://github.com/gwigz/slua/tree/main/packages/slua-web#compatibility"
								target="_blank"
								>compatibility list and progress on GitHub</a
							>. For now, you can use this page as a useful alternative to the
							Luau demo page.
						</p>
						<p>
							We're actively working on adding more features, interactive
							guides, and examples to help you learn SLua programming.
						</p>

						<div class="flex justify-center">
							<Button
								size="sm"
								variant="outline"
								class="mt-2"
								@click="showWelcome = false"
							>
								Close
							</Button>
						</div>
					</div>
				</div>

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
						<ContextMenu>
							<ContextMenuTrigger as-child>
								<Cube
									:scale="cubeScale"
									:color="cubeColor"
									:glow="cubeGlow"
									:died="cubeDied"
									@click="() => script?.touch(1)"
								/>
							</ContextMenuTrigger>
							<ContextMenuContent>
								<ContextMenuItem @click="() => script?.touch(1)">Touch</ContextMenuItem>
								<ContextMenuItem @click="() => script?.collision(1)">Collide</ContextMenuItem>
							</ContextMenuContent>
						</ContextMenu>
					</ResizablePanel>

					<ResizableHandle with-handle />

					<ResizablePanel class="flex flex-col bg-card/40 relative">
						<!-- output -->
						<div
							class="p-4 flex-1 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap"
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
												line.type === ChatType.WHISPER ||
												line.type === ChatType.SHOUT ||
												line.data.startsWith("/me ") ||
												line.data.startsWith("/me'")
													? ""
													: ": "
											}}</span
										><span :class="getChatClass(line.type)"
											>{{
												!line.data.startsWith("/me ") &&
												!line.data.startsWith("/me'") &&
												(line.type === ChatType.WHISPER
													? " whispers: "
													: line.type === ChatType.SHOUT
													? " shouts: "
													: "")
											}}{{
												line.data.replace(/^\/me('|\s)/, "$1").trim()
											}}</span
										>
									</div>
								</template>
							</div>

							<div v-else class="text-gray-500 italic">No output yet</div>
						</div>

						<!-- scroll to bottom button -->
						<button
							v-if="showScrollButton"
							@click="scrollToBottom"
							class="absolute bottom-12 right-2.5 px-1 py-1 bg-primary/80 text-white rounded hover:bg-primary transition-colors text-sm flex items-center gap-1"
						>
							<Icon icon="solar:arrow-down-bold" class="text-lg" />
						</button>

						<!-- chat input -->
						<div class="px-2 pb-2 border-muted">
							<form @submit.prevent="handleChatSubmit" class="flex gap-2">
								<input
									v-model="chatInput"
									type="text"
									placeholder="To nearby chat"
									class="flex-1 px-3 py-1.5 text-sm bg-background/30 border border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
									disabled
								/>
							</form>
						</div>
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
	computed,
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
} from "~/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { Button } from "~/components/ui/button";
import { cn } from "~/utilities/cn";
import Cube from "./cube.vue";

const MonacoEditor = inBrowser
	? defineAsyncComponent(() => import("./monaco-editor.vue"))
	: () => null;

const props = defineProps<{ storageKey?: string }>();
const slots = useSlots();

const code = ref(getCodeFromSlot());
const originalCode = ref(code.value);

const hasCodeChanged = computed(() => code.value !== originalCode.value);

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

const showWelcome = ref(true);

const chatInput = ref("");

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

	originalCode.value = code.value;

	const result = await slua.runScript(code.value, {
		onPrint: (...message) => {
			const now = Date.now() / 1000;

			output.push({
				timestamp: Math.floor(now),
				delta: now - Math.floor(now),
				type: ChatType.OWNER,
				name: "Object",
				data: message.join("\t"),
			});
		},
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

	stopScript();

	lastError.value = undefined;

	code.value = "";

	nextTick(() => {
		code.value = newCode;
		originalCode.value = newCode;
	});
}

function scrollToBottom() {
	autoScroll.value = true;
	showScrollButton.value = false;

	nextTick(() => outputRef.value?.scrollTo(0, outputRef.value.scrollHeight));
}

function handleChatSubmit() {
	const now = Date.now() / 1000;
	const message = chatInput.value.trim();

	if (!message.trim()) {
		return;
	}

	script.value?.listen(
		0,
		"Philip Linden",
		"a2e76fcd-9360-4f6d-a924-000000000003",
		message
	);

	output.push({
		timestamp: Math.floor(now),
		delta: now - Math.floor(now),
		type: ChatType.SAY,
		name: "Philip Linden",
		data: message,
	});

	chatInput.value = "";
}
</script>
