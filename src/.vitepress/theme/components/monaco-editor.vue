<template>
	<div
		class="bg-muted/20 border-4 rounded-lg border-card outline-1 outline-muted"
	>
		<div
			ref="editorContainer"
			class="w-full min-h-[50vh] bg-transparent rounded-lg overflow-hidden"
		></div>
	</div>
</template>

<script setup lang="ts">
import { shikiToMonaco } from "@shikijs/monaco";
import * as monaco from "monaco-editor";
import { createHighlighter } from "shiki";
import { useData } from "vitepress";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const { isDark } = useData();
const editorContainer = ref<HTMLElement | null>(null);

const props = defineProps<{
	modelValue: string;
	language?: string;
	theme?: string;
	errorLines?: number[];
}>();

const emit = defineEmits<(e: "update:modelValue", value: string) => void>();

let editor: monaco.editor.IStandaloneCodeEditor | null = null;

let decorationsCollection: monaco.editor.IEditorDecorationsCollection | null =
	null;

const updateErrorDecorations = () => {
	if (!editor || !props.errorLines) return;

	const decorations = props.errorLines.map((lineNumber) => ({
		range: new monaco.Range(lineNumber, 1, lineNumber, 1),
		options: {
			isWholeLine: true,
			className: "error-line",
			glyphMarginClassName: "error-glyph",
		},
	}));

	if (!decorationsCollection) {
		decorationsCollection = editor.createDecorationsCollection(decorations);
	} else {
		decorationsCollection.set(decorations);
	}
};

onMounted(async () => {
	if (!editorContainer.value) return;

	const highlighter = await createHighlighter({
		themes: ["catppuccin-latte", "catppuccin-mocha"],
		langs: ["luau", "typescript"],
	});

	monaco.languages.register({ id: "luau" });
	monaco.languages.register({ id: "typescript" });

	shikiToMonaco(highlighter, monaco);

	editor = monaco.editor.create(editorContainer.value, {
		value: props.modelValue,
		language: props.language ?? "luau",
		theme: isDark.value ? "catppuccin-mocha" : "catppuccin-latte",
		padding: {
			top: 20,
			bottom: 20,
		},
		minimap: { enabled: false },
		fontSize: 14,
		lineNumbers: "on", // can offset if we include sandbox in the editor somehow
		roundedSelection: false,
		scrollBeyondLastLine: false,
		automaticLayout: true,
	});

	editor.onDidChangeModelContent(() => {
		const value = editor?.getValue() ?? "";
		emit("update:modelValue", value);
	});

	updateErrorDecorations();
});

onBeforeUnmount(() => {
	if (editor) {
		editor.dispose();
	}
});

watch(
	() => props.modelValue,
	(newValue) => {
		if (editor && newValue !== editor.getValue()) {
			editor.setValue(newValue);
		}
	}
);

watch(
	() => props.errorLines,
	() => {
		updateErrorDecorations();
	},
	{ deep: true }
);

watch(
	() => isDark.value,
	(isDark) => {
		if (editor) {
			monaco.editor.setTheme(isDark ? "catppuccin-mocha" : "catppuccin-latte");
		}
	}
);
</script>

<style>
@reference "tailwindcss/theme";

.error-line {
	@apply bg-red-500/10;
}

.error-glyph {
	@apply bg-red-500 w-1;
}

.monaco-editor {
	@apply !bg-transparent !outline-none !bg-transparent !bg-transparent;
}

.monaco-editor-background {
	@apply !bg-transparent;
}

.monaco-editor .margin {
	@apply !bg-transparent;
}
</style>
