<script setup lang="ts">
import type { Mesh } from "three";
import { watch, ref } from "vue";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { useTresContext, useLoop } from "@tresjs/core";

type Props = {
	mesh: Mesh | null;
	text?: string;
	color?: string;
	alpha?: number;
};

const props = defineProps<Props>();

const { camera } = useTresContext();
const { onAfterRender } = useLoop();

const labelRef = ref<HTMLDivElement | null>(null);
const label = ref<CSS2DObject | null>(null);

watch(
	() => props.mesh,
	() => {
		if (!props.mesh) {
			return;
		}

		props.mesh.layers.enableAll();

		labelRef.value = document.createElement("div");

		labelRef.value.textContent = props.text ?? "";
		labelRef.value.style.color = props.color ?? "white";
		labelRef.value.style.opacity = props.alpha?.toString() ?? "1";

		labelRef.value.style.fontSize = "12px";
		labelRef.value.style.fontWeight = "bold";
		labelRef.value.style.textAlign = "center";
		labelRef.value.style.textShadow = "1px 1px 0 rgba(0, 0, 0, 0.5)";
		labelRef.value.style.whiteSpace = "pre";
		labelRef.value.style.lineHeight = "1";

		label.value = new CSS2DObject(labelRef.value);
		const scale = props.mesh.scale;

		label.value.position.set(0, (scale.y / 2) * 3, 0);

		props.mesh.add(label.value);

		label.value.center.set(0.5, 1);
		label.value.layers.set(1);

		onAfterRender(() => {
			if (!props.mesh || !label.value || !camera.value) {
				return;
			}

			const distance = props.mesh.position.distanceTo(camera.value.position);

			const minDistance = 20;
			const maxDistance = 40;

			let opacity = 1 - (distance - minDistance) / (maxDistance - minDistance);

			opacity = Math.max(0, Math.min(props.alpha ?? 1, opacity));

			label.value.element.style.opacity = opacity.toString();
		});
	}
);

watch(
	() => props.text,
	(newText) => {
		if (labelRef.value) {
			labelRef.value.textContent = newText ?? "";
		}
	}
);

watch(
	() => props.color,
	(newColor) => {
		if (labelRef.value) {
			labelRef.value.style.color = newColor ?? "white";
		}
	}
);

watch(
	() => props.alpha,
	(newAlpha) => {
		if (labelRef.value) {
			labelRef.value.style.opacity = newAlpha?.toString() ?? "1";
		}
	}
);
</script>

<template></template>
