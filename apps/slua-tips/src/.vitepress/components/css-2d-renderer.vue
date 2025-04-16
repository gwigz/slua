<script setup lang="ts">
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { onUnmounted, ref, watchEffect } from "vue";
import { useLoop, useTresContext } from "@tresjs/core";

const { renderer, camera } = useTresContext();
const { onAfterRender } = useLoop();
const cleanup = ref<(() => void) | null>(null);
const labelRenderer = ref<CSS2DRenderer | null>(null);

watchEffect(() => {
	if (!camera.value || !renderer.value) {
		return;
	}

	camera.value.layers.enableAll();

	labelRenderer.value = new CSS2DRenderer();

	const updateSize = () => {
		if (labelRenderer.value && renderer.value) {
			labelRenderer.value.setSize(
				renderer.value.domElement.width,
				renderer.value.domElement.height
			);
		}
	};

	updateSize();

	labelRenderer.value.domElement.style.position = "absolute";
	labelRenderer.value.domElement.style.top = "0";
	labelRenderer.value.domElement.style.left = "0";
	labelRenderer.value.domElement.style.width = "100%";
	labelRenderer.value.domElement.style.height = "100%";
	labelRenderer.value.domElement.style.pointerEvents = "none";
	labelRenderer.value.domElement.style.zIndex = "1";

	renderer.value.domElement.parentElement?.appendChild(
		labelRenderer.value.domElement
	);

	const resizeObserver = new ResizeObserver(updateSize);

	resizeObserver.observe(renderer.value.domElement);

	const { off } = onAfterRender(({ scene, camera }) => {
		labelRenderer.value?.render(scene, camera);
	});

	cleanup.value = () => {
		off();

		resizeObserver.disconnect();

		if (labelRenderer.value && renderer.value?.domElement.parentElement) {
			renderer.value.domElement.parentElement.removeChild(
				labelRenderer.value.domElement
			);
		}
	};
});

onUnmounted(() => cleanup.value?.());
</script>

<template>
	<slot />
</template>
