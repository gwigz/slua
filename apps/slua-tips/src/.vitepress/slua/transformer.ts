import type { MarkdownOptions } from 'vitepress';

type Transformer = NonNullable<MarkdownOptions['codeTransformers']>[number];

export const sluaTransformer: Transformer = {
	name: 'slua-transformer',
	// code: (code) => {
	// 	console.log(code.children[0]);

	// 	return code;
	// },
	// postprocess: (code) => {
	// 	console.log(code);

	// 	return code;
	// },
};
