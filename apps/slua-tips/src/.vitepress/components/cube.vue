<template>
	<div ref="container" class="relative w-full h-full select-none">
		<TresCanvas :tone-mapping-exposure="0.25">
			<OrbitControls
				make-default
				:rotate-speed="0.5"
				:auto-rotate-speed="2"
				:damping-factor="0.02"
				:enable-zoom="false"
				:enable-pan="false"
				:enable-damping="true"
			/>

			<Sky :azimuth="45" :elevation="2" />

			<Environment
				files="/assets/sunset.hdr"
				:blur=".5"
				:environment-intensity="0.6"
			/>

			<Suspense>
				<TresMesh
					:rotation="[0, Math.PI / 4, 0]"
					:scale="scale"
					:visible="!died"
					@pointer-enter="
						() => container && (container.style.cursor = 'pointer')
					"
					@pointer-leave="
						() => container && (container.style.cursor = 'default')
					"
					@click="onClick"
					@context-menu="onRightClick"
				>
					<TresBoxGeometry :args="[1, 1, 1]" />
					<TresMeshStandardMaterial
						:map="texture"
						:color="color"
						:emissive="emissive"
						:emissiveIntensity="glow * 2"
					/>
				</TresMesh>
			</Suspense>

			<Grid
				:args="[10, 10]"
				:position="[0, -0.25, 0]"
				:cell-size="1"
				section-color="#7f7f7f"
				:section-size="2"
				:infinite-grid="true"
				:fade-from="0"
				:fade-distance="12"
				:fade-strength="1"
			/>

			<!-- <Suspense>
				<Ocean :position="[0, -0.425, 0]" />
			</Suspense> -->

			<EffectComposerPmndrs>
				<VignettePmndrs :darkness="0.2" />
			</EffectComposerPmndrs>
		</TresCanvas>

		<div
			v-if="died"
			class="absolute inset-0 flex items-center bg-black/10 justify-center pointer-events-none animate-[fadeIn_1.5s_ease-out]"
		>
			<div
				:class="
					cn(
						'absolute inset-0 opacity-80 h-18 top-1/2 -translate-y-1/2',
						'bg-[linear-gradient(0deg,transparent,black_40%,black_60%,transparent)]'
					)
				"
			></div>

			<div class="death-screen-text">
				<h1 class="text-5xl text-[#761d1e] font-serif uppercase">Cube Died</h1>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Environment, Sky, Grid, OrbitControls } from "@tresjs/cientos";
import { TresCanvas, useTexture } from "@tresjs/core";
import type { Texture } from "three";
import {
	EffectComposerPmndrs,
	VignettePmndrs,
} from "@tresjs/post-processing";
import { computed, onMounted, ref } from "vue";
import { useData } from "vitepress";
import { cn } from "~/utilities/cn";

const { isDark } = useData();

const container = ref<HTMLDivElement | null>(null);
const texture = ref<Texture | null>(null);

const props = defineProps<{
	died?: boolean;
	scale?: [number, number, number];
	color?: string;
	glow?: number;
	onClick?: () => void;
	onRightClick?: (event: MouseEvent) => void;
}>();

const scale = computed(
	() =>
		(props.scale ?? ([0.5, 0.5, 0.5] as [number, number, number])).map((v) =>
			Math.max(0.01, v)
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

<style>
@keyframes deathScreenText {
	0% {
		opacity: 0;
		transform: scale(0.8);
		visibility: hidden;
	}
	0.1% {
		visibility: visible;
	}
	100% {
		opacity: 1;
		transform: scale(1);
		visibility: visible;
	}
}

.death-screen-text {
	animation: deathScreenText 1.4s ease-out 0.8s forwards;
	visibility: hidden;
}
</style>
