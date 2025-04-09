<template>
	<div
		class="bg-muted/20 border-4 rounded-lg border-card outline-1 outline-muted w-full h-full"
	>
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

			<TresMesh :rotation="[0, Math.PI / 4, 0]">
				<TresBoxGeometry :args="[1, 1, 1]" />
				<TresMeshStandardMaterial :map="texture" />
			</TresMesh>
		</TresCanvas>
	</div>
</template>

<script setup lang="ts">
import { OrbitControls } from '@tresjs/cientos';
import { TresCanvas, useTexture } from '@tresjs/core';
import type { Texture } from 'three';
import { useData } from 'vitepress';
import { onMounted, ref } from 'vue';

const { isDark } = useData();
const texture = ref<Texture | null>(null);

onMounted(async () => {
	texture.value = await useTexture(['/assets/plywood.jpg']);
});
</script>
