<script setup lang="ts">
import { watch, reactive, ref, onMounted, onUnmounted } from "vue";
import { useMagicKeys } from "@vueuse/core";
import { CameraControls, BaseCameraControls } from "@tresjs/cientos";
import { useTresContext } from "@tresjs/core";
import type { default as CameraControlsTypes } from "camera-controls";
import { Vector2 } from "three";

const { camera, renderer, raycaster, scene } = useTresContext();
const cameraControls = ref<CameraControlsTypes | null>(null);

const mouseButtons = reactive<CameraControlsTypes["mouseButtons"]>({
	left: BaseCameraControls.ACTION.NONE,
	middle: BaseCameraControls.ACTION.NONE,
	right: BaseCameraControls.ACTION.NONE,
	wheel: BaseCameraControls.ACTION.DOLLY,
});

const { ctrl, alt, shift, escape } = useMagicKeys();
const mouseDown = ref(false);
const isZooming = ref(false);

const cursors = {
	// [ctrl, alt, shift]
	[[false, true, false].toString()]: "zoom",
	[[true, true, false].toString()]: "rotate",
	[[true, false, false].toString()]: "rotate",
	[[true, true, true].toString()]: "pan",
	[[true, false, true].toString()]: "pan",
};

const modes = {
	zoom: BaseCameraControls.ACTION.ROTATE,
	rotate: BaseCameraControls.ACTION.ROTATE,
	pan: BaseCameraControls.ACTION.TRUCK,
};

function handleMouseMove(event: MouseEvent) {
	if (isZooming.value && cameraControls.value) {
		const sign = -Math.sign(event.movementY);

		const dampenedMovement =
			sign * Math.pow(Math.abs(event.movementY), 1.4) * 0.05;

		// @ts-ignore types seem wrong
		cameraControls.value.instance.dolly(dampenedMovement, true);
	}
}

const handleClick = (event: MouseEvent) => {
	if (
		!camera.value ||
		!renderer.value ||
		!cameraControls.value ||
		!scene.value ||
		!alt.value
	) {
		return;
	}

	const rect = renderer.value.domElement.getBoundingClientRect();
	const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
	const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

	raycaster.value.setFromCamera(new Vector2(x, y), camera.value);

	const intersects = raycaster.value.intersectObjects(
		scene.value.children,
		true
	);

	if (intersects.length > 1 && intersects[0].object.name) {
		const point = intersects[0].point;

		// @ts-ignore types seem wrong
		cameraControls.value.instance.setTarget(point.x, point.y, point.z, true);

		// move cursor to middle of the bounding box
	}
};

function resetCamera(animate = false) {
	// @ts-ignore types seem wrong
	cameraControls.value.instance.setTarget(0, 25.5, 0, animate);
	// @ts-ignore types seem wrong
	cameraControls.value.instance.rotatePolarTo(1.4, animate);
	// @ts-ignore types seem wrong
	cameraControls.value.instance.rotateAzimuthTo(4.2, animate);
	// @ts-ignore types seem wrong
	cameraControls.value.instance.dollyTo(2.5, true);
}

onMounted(() => {
	const handleMouseDown = (event: MouseEvent) => {
		if (event.button === 0) {
			handleClick(event);

			mouseDown.value = true;
		}
	};

	const handleMouseUp = (event: MouseEvent) => {
		if (event.button === 0) {
			mouseDown.value = false;
		}
	};

	if (renderer.value?.domElement) {
		renderer.value.domElement.addEventListener("mousedown", handleMouseDown);
		renderer.value.domElement.addEventListener("mouseup", handleMouseUp);
	}

	resetCamera();

	onUnmounted(() => {
		if (renderer.value?.domElement) {
			renderer.value.domElement.removeEventListener(
				"mousedown",
				handleMouseDown
			);
			renderer.value.domElement.removeEventListener("mouseup", handleMouseUp);
		}
	});
});

watch(escape, (escape) => {
	if (escape) {
		resetCamera(true);
	}
});

watch([ctrl, alt, shift, mouseDown], ([ctrl, alt, shift, isLeftMouseDown]) => {
	const cursor = cursors[[ctrl, alt, shift].toString()];

	if (isLeftMouseDown) {
		if (
			alt &&
			!window.document.pointerLockElement &&
			renderer.value.domElement
		) {
			renderer.value.domElement.requestPointerLock({
				unadjustedMovement: true,
			});

			renderer.value.domElement.addEventListener("mousemove", handleMouseMove);
		}

		if (cursor) {
			mouseButtons.left = modes[cursor];
			mouseButtons.wheel = BaseCameraControls.ACTION.NONE;

			isZooming.value = cursor === "zoom";
		} else if (mouseButtons.left !== BaseCameraControls.ACTION.NONE) {
			mouseButtons.left = BaseCameraControls.ACTION.ROTATE;
			mouseButtons.wheel = BaseCameraControls.ACTION.NONE;

			isZooming.value = true;
		}
	} else {
		window.document.exitPointerLock();

		renderer.value.domElement.removeEventListener("mousemove", handleMouseMove);

		const defaultCursor =
			renderer.value.domElement.style.cursor === "pointer"
				? "pointer"
				: "default";

		renderer.value.domElement.style.cursor =
			alt && cursor
				? `url('/assets/cursor-${cursor}.webp'), default`
				: defaultCursor;

		mouseButtons.left = BaseCameraControls.ACTION.NONE;
		mouseButtons.wheel = BaseCameraControls.ACTION.DOLLY;

		isZooming.value = false;
	}

	// @ts-ignore types seem wrong
	if (cameraControls.value?.instance) {
		if (isZooming.value) {
			// @ts-ignore types seem wrong
			const currentPolarAngle = cameraControls.value.instance.polarAngle;

			// @ts-ignore types seem wrong
			cameraControls.value.instance.minPolarAngle = currentPolarAngle;
			// @ts-ignore types seem wrong
			cameraControls.value.instance.maxPolarAngle = currentPolarAngle;
		} else {
			// @ts-ignore types seem wrong
			cameraControls.value.instance.minPolarAngle = -Infinity;
			// @ts-ignore types seem wrong
			cameraControls.value.instance.maxPolarAngle = Infinity;
		}
	}

	console.log(cameraControls.value?.instance);
});
</script>

<template>
	<TresPerspectiveCamera  />

	<CameraControls
		ref="cameraControls"
		:mouse-buttons="mouseButtons"
		:min-distance="0.25"
		:max-distance="100"
		:azimuth-rotate-speed="0.8"
		:polar-rotate-speed="0.8"
		:dolly-speed="1.25"
		:truck-speed="5"
		:smooth-time="0.125"
	/>
</template>
