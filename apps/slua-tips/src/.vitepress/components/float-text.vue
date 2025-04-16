<script setup lang="ts">
import type { Mesh } from "three";
import { watch } from "vue";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { useTresContext, useLoop } from "@tresjs/core";

type Props = {
	mesh: Mesh | null;
	color?: string;
	alpha?: number;
	content: string;
};

const props = defineProps<Props>();

const { camera } = useTresContext();
const { onAfterRender } = useLoop();

watch(
	() => props.mesh,
	() => {
		if (!props.mesh) {
			return;
		}

		props.mesh.layers.enableAll();

		const labelDiv = document.createElement("div");

		labelDiv.className = "label";
		labelDiv.textContent = props.content;
		labelDiv.style.color = props.color ?? "white";
		labelDiv.style.opacity = props.alpha?.toString() ?? "1";

		labelDiv.style.fontSize = "12px";
		labelDiv.style.fontWeight = "bold";
		labelDiv.style.textAlign = "center";
		labelDiv.style.textShadow = "1px 1px 0 rgba(0, 0, 0, 0.5)";

		const label = new CSS2DObject(labelDiv);
		const scale = props.mesh.scale;

		label.position.set(0, (scale.y / 2) * 3, 0);

		props.mesh.add(label);

		label.center.set(0.5, 1);
		label.layers.set(1);

		onAfterRender(() => {
			if (!props.mesh || !label || !camera.value) {
				return;
			}

			const distance = props.mesh.position.distanceTo(camera.value.position);

			const minDistance = 20;
			const maxDistance = 40;

			let opacity = 1 - (distance - minDistance) / (maxDistance - minDistance);

			opacity = Math.max(0, Math.min(props.alpha ?? 1, opacity));

			label.element.style.opacity = opacity.toString();
		});
	}
);
</script>

<template></template>
