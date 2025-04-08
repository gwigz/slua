<template>
	<div
		ref="editorContainer"
		class="bg-muted/20 border-4 rounded-lg border-card outline-1 outline-muted h-full"
	></div>
</template>

<script setup lang="ts">
import { shikiToMonaco } from "@shikijs/monaco";
import * as monaco from "monaco-editor";
import { createHighlighter } from "shiki";
import { useData } from "vitepress";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

import documentation from "../../slua/documentation";
import globals from "../../slua/globals";

const { isDark } = useData();
const editorContainer = ref<HTMLElement | null>(null);

const props = defineProps<{
	modelValue: string;
	language?: string;
	theme?: string;
	errorLines?: number[];
	storageKey?: string;
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
	if (!editorContainer.value) {
		return;
	}

	// Load from localStorage if storageKey is provided
	const initialValue = props.storageKey
		? localStorage.getItem(props.storageKey) ?? props.modelValue
		: props.modelValue;

	const highlighter = await createHighlighter({
		themes: ["catppuccin-latte", "catppuccin-mocha"],
		langs: ["luau"],
	});

	monaco.languages.register({ id: "luau" });

	const globalRegex = new RegExp(
		`(?:^|\\(|\\s|,|=)(${Object.keys(globals).join("|")})\.([a-zA-Z0-9]+)?$`
	);

	// const constRegex = new RegExp(
	// 	`(?:^|\(|\s|,|=)(${Object.keys(globals)
	// 		.map((name) => name[0])
	// 		.join("|")}|[A-Z])$`
	// );

	monaco.languages.registerCompletionItemProvider("luau", {
		provideCompletionItems(model, position) {
			const line = model.getValueInRange({
				startLineNumber: position.lineNumber,
				endLineNumber: position.lineNumber,
				startColumn: 0,
				endColumn: position.column,
			});

			const word = model.getWordUntilPosition(position);

			const range = {
				startLineNumber: position.lineNumber,
				endLineNumber: position.lineNumber,
				startColumn: word.startColumn,
				endColumn: word.endColumn,
			};

			const match = line.match(globalRegex);
			const suggestions = match && globals[match[1] as keyof typeof globals];

			if (suggestions) {
				return {
					suggestions: suggestions.map((suggestion) => ({
						label: suggestion,
						kind: monaco.languages.CompletionItemKind.Function,
						insertText: suggestion,
						range,
					})),
				};
			}

			return null;
		},
	});

	function formatArgs(args: { name: string; desc: string; type: string[] }[]) {
		return args.map((arg) => `${arg.name}: ${arg.type.join(" | ")}`).join(", ");
	}

	monaco.languages.registerHoverProvider("luau", {
		provideHover(model, position) {
			const line = model.getValueInRange({
				startLineNumber: position.lineNumber,
				endLineNumber: position.lineNumber,
				startColumn: 0,
				endColumn: position.column,
			});

			const match = line.match(globalRegex);
			const word = model.getWordAtPosition(position)?.word;

			const parent =
				match && documentation[match[1] as keyof typeof documentation];

			const details = word && parent?.[word];

			if (details && match) {
				return {
					contents: [
						{
							value: `**function ${match[1]}.${word}(${formatArgs(
								details.args
							)})**`,
						},
						{ value: details.desc },
						...(details.link
							? [{ value: `[${details.link}](${details.link})` }]
							: []),
					],
				};
			}
		},
	});

	shikiToMonaco(highlighter, monaco);

	editor = monaco.editor.create(editorContainer.value, {
		value: initialValue,
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

	editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
		const selection = editor?.getSelection();
		const model = editor?.getModel();

		if (!selection || !model) {
			return;
		}

		const startLine = selection.startLineNumber;
		const endLine = selection.endLineNumber;
		const startColumn = selection.startColumn;
		const endColumn = selection.endColumn;

		let isCommented = true;

		for (let i = startLine; i <= endLine; i++) {
			const lineContent = model.getLineContent(i);
			if (!lineContent.trim().startsWith("--")) {
				isCommented = false;
				break;
			}
		}

		editor?.executeEdits("", [
			...Array.from({ length: endLine - startLine + 1 }, (_, i) => {
				const lineNumber = startLine + i;
				const lineContent = model.getLineContent(lineNumber);

				if (isCommented) {
					return {
						range: new monaco.Range(lineNumber, 1, lineNumber, 3),
						text: "",
					};
				}

				return {
					range: new monaco.Range(lineNumber, 1, lineNumber, 1),
					text: "--",
				};
			}),
		]);

		editor?.setSelection(
			new monaco.Selection(startLine, startColumn, endLine, endColumn)
		);
	});

	editor.onDidChangeModelContent(() => {
		const value = editor?.getValue() ?? "";
		emit("update:modelValue", value);

		// Save to localStorage if storageKey is provided
		if (props.storageKey) {
			localStorage.setItem(props.storageKey, value);
		}
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
	() => updateErrorDecorations(),
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

.monaco-hover .rendered-markdown p {
	@apply leading-snug;
}
</style>
