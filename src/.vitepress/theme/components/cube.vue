<template>
	<div class="absolute top-0 right-0">
		<TresCanvas class="!h-64 !w-64 cursor-grab select-none">
			<!-- <TresOrthographicCamera :position="[0, 20, 15]" :zoom="12" make-default> -->
			<!-- <TresPointLight color="#fff" :intensity="200" /> -->
			<!-- </TresOrthographicCamera> -->

			<TresAmbientLight :color="'#fff'" :intensity="0.1" />

			<TresPerspectiveCamera :position="[3, 3, 3]" :look-at="[0, 0, 0]">
				<TresPointLight color="#fff" :intensity="15" />
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

			<TresMesh :rotation="[0, Math.PI / 4, 0]">
				<TresBoxGeometry :args="[1, 1, 1]" />
				<TresMeshStandardMaterial :map="texture" />
			</TresMesh>
		</TresCanvas>
	</div>
</template>

<script setup lang="ts">
import { OrbitControls } from "@tresjs/cientos";
import { TresCanvas, useTexture } from "@tresjs/core";
import type { Texture } from "three";
import { onMounted, ref } from "vue";

const texture = ref<Texture | null>(null);

onMounted(async () => {
	texture.value = await useTexture(["/assets/img/plywood.jpg"]);
});
</script>
