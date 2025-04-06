import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";

import { NolebaseInlineLinkPreviewPlugin } from "@nolebase/vitepress-plugin-inline-link-preview/client";
import "@nolebase/vitepress-plugin-inline-link-preview/client/style.css";

import { NolebaseGitChangelogPlugin } from "@nolebase/vitepress-plugin-git-changelog/client";
import "@nolebase/vitepress-plugin-git-changelog/client/style.css";

import Gradient from "./components/gradient.vue";
import ResourceCard from "./components/resource-card.vue";

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
		app.component("ResourceCard", ResourceCard);
		app.use(NolebaseInlineLinkPreviewPlugin);
		app.use(NolebaseGitChangelogPlugin);
	},
} satisfies Theme;
