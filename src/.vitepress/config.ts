import { defineConfig } from "vitepress";

// import {
// 	GitChangelog,
// 	GitChangelogMarkdownSection,
// } from "@nolebase/vitepress-plugin-git-changelog/vite";
import { InlineLinkPreviewElementTransform } from "@nolebase/vitepress-plugin-inline-link-preview/markdown-it";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { createFileSystemTypesCache } from "@shikijs/vitepress-twoslash/cache-fs";

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
			{
				name: "vp-tw-order-fix",
				configResolved(c) {
					movePlugin(
						// biome-ignore lint/suspicious/noExplicitAny: types don't match vitepress
						c.plugins as any,
						"@tailwindcss/vite:scan",
						"after",
						"vitepress",
					);
				},
			},
		],
		optimizeDeps: {
			exclude: ["@nolebase/vitepress-plugin-inline-link-preview/markdown-it"],
		},
		ssr: {
			noExternal: ["@nolebase/*"],
		},
	},
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		logo: "/assets/logo.png",
		nav: [{ text: "Examples", link: "/markdown-examples" }],
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
		footer: {
			message:
				'<span class="font-normal"><a href="https://slua.tips">slua.tips</a> is not affiliated with Second Life, Linden Lab, or Luau.<br />All trademarks and registered trademarks are the property of their respective owners.</span>',
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
			transformerTwoslash({
				typesCache: createFileSystemTypesCache(),
				// biome-ignore lint/suspicious/noExplicitAny: types don't match vitepress
			}) as any,
		],
		config: (md) => {
			md.use(InlineLinkPreviewElementTransform);
		},
	},
	lastUpdated: true,
});

function movePlugin(
	plugins: { name: string }[],
	pluginAName: string,
	order: "before" | "after",
	pluginBName: string,
) {
	const pluginBIndex = plugins.findIndex((p) => p.name === pluginBName);
	if (pluginBIndex === -1) return;

	const pluginAIndex = plugins.findIndex((p) => p.name === pluginAName);
	if (pluginAIndex === -1) return;

	if (order === "before" && pluginAIndex > pluginBIndex) {
		const pluginA = plugins.splice(pluginAIndex, 1)[0];
		plugins.splice(pluginBIndex, 0, pluginA);
	}

	if (order === "after" && pluginAIndex < pluginBIndex) {
		const pluginA = plugins.splice(pluginAIndex, 1)[0];
		plugins.splice(pluginBIndex, 0, pluginA);
	}
}
