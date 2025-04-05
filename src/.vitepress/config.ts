import { defineConfig } from "vitepress";

// import {
// 	GitChangelog,
// 	GitChangelogMarkdownSection,
// } from "@nolebase/vitepress-plugin-git-changelog/vite";
import { InlineLinkPreviewElementTransform } from "@nolebase/vitepress-plugin-inline-link-preview/markdown-it";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";

import tailwindcss from "@tailwindcss/vite";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	lang: "en-US",
	title: "slua.tips",
	description: "Tips and tricks for SLua",
	vite: {
		plugins: [
			// biome-ignore lint/suspicious/noExplicitAny: types don't match vitepress
			tailwindcss() as any,
		],
	},
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Examples", link: "/markdown-examples" },
		],
		sidebar: [
			{
				text: "Examples",
				items: [
					{ text: "Markdown Examples", link: "/markdown-examples" },
					{ text: "Runtime API Examples", link: "/api-examples" },
				],
			},
		],
		socialLinks: [
			{ icon: "github", link: "https://github.com/gwigz/slua-tips" },
		],
		editLink: {
			text: "Edit this page on GitHub",
			pattern: "https://github.com/gwigz/slua-tips/edit/main/src/:path",
		},
	},
	head: [
		[
			"meta",
			{
				name: "viewport",
				content: "width=device-width,initial-scale=1,user-scalable=no",
			},
		],
	],
	markdown: {
		theme: {
			light: "github-light",
			dark: "github-dark",
		},
		codeTransformers: [
			// biome-ignore lint/suspicious/noExplicitAny: types don't match vitepress
			transformerTwoslash() as any,
		],
		config: (md) => {
			md.use(InlineLinkPreviewElementTransform);
		},
	},
	lastUpdated: true,
});
