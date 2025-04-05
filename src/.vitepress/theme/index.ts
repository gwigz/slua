import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";

import Gradient from "./gradient.vue";

import TwoslashFloatingVue from "@shikijs/vitepress-twoslash/client";
import "@shikijs/vitepress-twoslash/style.css";

import { NolebaseInlineLinkPreviewPlugin } from "@nolebase/vitepress-plugin-inline-link-preview/client";
import "@nolebase/vitepress-plugin-inline-link-preview/client/style.css";

import "../../tailwind.css";

export default {
	extends: DefaultTheme,
	Layout: () => {
		return h(DefaultTheme.Layout, null, {
			// https://vitepress.dev/guide/extending-default-theme#layout-slots
			"layout-top": () => h(Gradient),
		});
	},
	enhanceApp({ app }) {
		app.use(TwoslashFloatingVue);
		app.use(NolebaseInlineLinkPreviewPlugin);
	},
} satisfies Theme;
