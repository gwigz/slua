<template>
	<TresCanvas class="cursor-grab select-none">
		<!-- <TresOrthographicCamera :position="[0, 20, 15]" :zoom="12" make-default> -->
		<!-- <TresPointLight color="#fff" :intensity="200" /> -->
		<!-- </TresOrthographicCamera> -->

		<TresAmbientLight :color="'#fff'" :intensity="isDark ? 0.1 : 0.3" />

		<TresPerspectiveCamera :position="[3, 3, 3]" :look-at="[0, 0, 0]">
			<TresPointLight color="#fff" :intensity="isDark ? 15 : 15" />
		</TresPerspectiveCamera>

		<OrbitControls
			make-default
			:rotate-speed="0.5"
			:auto-rotate-speed="2"
			:damping-factor="0.02"
			:enable-zoom="false"
			:enable-pan="false"
			:enable-damping="true"
		/>

		<TresMesh :rotation="[0, Math.PI / 4, 0]" :scale="scale">
			<TresBoxGeometry :args="[1, 1, 1]" />
			<TresMeshStandardMaterial
				:map="texture"
				:color="color"
				:emissive="emissive"
				:emissiveIntensity="glow * 2"
			/>
		</TresMesh>

		<EffectComposerPmndrs>
			<BloomPmndrs
				:radius="0.85"
				:intensity="4.0"
				:luminance-threshold="0.1"
				:luminance-smoothing="0.3"
			/>
		</EffectComposerPmndrs>
	</TresCanvas>
</template>

<script setup lang="ts">
import { OrbitControls } from "@tresjs/cientos";
import { TresCanvas, useTexture } from "@tresjs/core";
import { BloomPmndrs, EffectComposerPmndrs } from "@tresjs/post-processing";
import type { Texture } from "three";
import { useData } from "vitepress";
import { computed, onMounted, ref } from "vue";

const { isDark } = useData();
const texture = ref<Texture | null>(null);

const props = defineProps<{
	scale?: [number, number, number];
	color?: string;
	glow?: number;
}>();

const scale = computed(
	() =>
		(props.scale ?? ([0.5, 0.5, 0.5] as [number, number, number])).map(
			// scales cannot be less than 0.010 (* 2 till the camera position is better)
			(v) => Math.max(0.01, v) * 2
		) as [number, number, number]
);

const color = computed(() => props.color ?? "#ffffff");
const glow = computed(() => props.glow ?? 0);

// emissive should depend on color and glow, higher the glow the more emissive
const emissive = computed(() => {
	const baseColor = props.color ?? "#ffffff";
	const glowIntensity = props.glow ?? 0;

	const hex = baseColor.replace("#", "");
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	const toHex = (n: number) =>
		Math.round(n * glowIntensity)
			.toString(16)
			.padStart(2, "0");

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
});

onMounted(async () => {
	texture.value = await useTexture(["/assets/plywood.jpg"]);
});
</script>
