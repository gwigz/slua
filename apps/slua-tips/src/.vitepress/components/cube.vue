<template>
	<div
		class="relative w-full h-full select-none"
		@contextmenu.prevent="
			(event) => {
				if (canvasRef?.$el && canvasRef.$el.style.cursor === 'pointer') {
					onRightClick?.(event);
				}
			}
		"
	>
		<TresCanvas ref="canvasRef" :tone-mapping-exposure="0.25" antialias>
			<CameraControls />

			<Sky :azimuth="45" :elevation="2" />

			<Suspense>
				<Environment
					files="/assets/sunset.hdr"
					:blur="0.5"
					:environment-intensity="0.6"
				/>
			</Suspense>

			<Suspense>
				<TresMesh
					name="Object"
					:rotation="[0, Math.PI / 4, 0]"
					:position-y="25.25"
					:scale="scale"
					:visible="!died"
					@pointer-enter="
						if (canvasRef?.$el && canvasRef.$el.style.cursor === 'default') {
							canvasRef.$el.style.cursor = 'pointer';
						}
					"
					@pointer-leave="
						if (canvasRef?.$el && canvasRef.$el.style.cursor === 'pointer') {
							canvasRef.$el.style.cursor = 'default';
						}
					"
					@click="
						() => {
							const cursor = canvasRef?.$el?.style.cursor;

							if (cursor === 'pointer' || cursor === 'default') {
								onClick?.();
							}
						}
					"
					cast-shadow
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

			<TresMesh
				name="Ground"
				:position-y="25"
				:rotation-x="-Math.PI / 2"
				receive-shadow
			>
				<TresPlaneGeometry :args="[256, 256]" />
				<TresMeshStandardMaterial :map="grass" />
			</TresMesh>

			<Suspense>
				<Ocean :position-y="20" />
			</Suspense>

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
import { Environment, Sky, Ocean } from "@tresjs/cientos";
import { TresCanvas, useTexture } from "@tresjs/core";
import { RepeatWrapping, type Texture } from "three";
import { EffectComposerPmndrs, VignettePmndrs } from "@tresjs/post-processing";
import { computed, onMounted, ref } from "vue";
import CameraControls from "./camera-controls.vue";
import { cn } from "~/utilities/cn";

const props = defineProps<{
	died?: boolean;
	scale?: [number, number, number];
	color?: string;
	glow?: number;
	onClick?: () => void;
	onRightClick?: (event: MouseEvent) => void;
}>();

const canvasRef = ref<InstanceType<typeof TresCanvas> | null>(null);

const texture = ref<Texture | null>(null);
const grass = ref<Texture | null>(null);

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
	grass.value = await useTexture(["/assets/grass.webp"]);

	grass.value.repeat.set(12, 12);
	grass.value.wrapS = RepeatWrapping;
	grass.value.wrapT = RepeatWrapping;
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
