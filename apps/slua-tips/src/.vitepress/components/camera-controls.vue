<script setup lang="ts">
import { watch, reactive, ref } from "vue";
import { useMagicKeys, useMouse, useMousePressed } from "@vueuse/core";
import { CameraControls, BaseCameraControls } from "@tresjs/cientos";
import { useTresContext } from "@tresjs/core";
import type { default as CameraControlsTypes } from "camera-controls";
import { Vector3 } from "three";

const { camera } = useTresContext();

const cameraControls = ref<CameraControlsTypes | null>(null);

const mouseButtons = reactive<CameraControlsTypes["mouseButtons"]>({
	left: BaseCameraControls.ACTION.ROTATE,
	middle: BaseCameraControls.ACTION.NONE,
	right: BaseCameraControls.ACTION.NONE,
	wheel: BaseCameraControls.ACTION.DOLLY,
});

const { ctrl, alt, shift } = useMagicKeys();
const { x, y } = useMouse();
const { pressed } = useMousePressed();

const lastY = ref(0);
const isZooming = ref(false);

const cursors = {
	// [ctrl, alt, shift]
	[[false, true, false].toString()]: "zoom-in", // zoom & rotate
	[[true, true, false].toString()]: "alias", // rotate
	[[true, false, false].toString()]: "alias", // rotate
	[[true, true, true].toString()]: "move", // pan
	[[true, false, true].toString()]: "move", // pan
};

const modes = {
	"zoom-in": BaseCameraControls.ACTION.ROTATE,
	alias: BaseCameraControls.ACTION.ROTATE,
	move: BaseCameraControls.ACTION.OFFSET,
};

const minPolarAngle = ref(-Infinity);
const maxPolarAngle = ref(Infinity);

function getPolarAngle() {
	if (!camera.value) {
		return 0;
	}

	const dot = camera.value
		.getWorldPosition(new Vector3())
		.normalize()
		.dot(new Vector3(0, 1, 0));

	// convert to angle in radians
	return Math.acos(Math.max(-1, Math.min(1, dot)));
}

watch([ctrl, alt, shift, pressed], ([ctrl, alt, shift, pressed]) => {
	const cursor = cursors[[ctrl, alt, shift].toString()];

	if (cursor) {
		mouseButtons.left = modes[cursor];
		mouseButtons.wheel = BaseCameraControls.ACTION.NONE;

		isZooming.value = cursor === "zoom-in";
	} else {
		mouseButtons.left = BaseCameraControls.ACTION.ROTATE;

		mouseButtons.wheel = pressed
			? BaseCameraControls.ACTION.NONE
			: BaseCameraControls.ACTION.DOLLY;

		isZooming.value = pressed;
	}

	if (isZooming.value) {
		const currentPolarAngle = getPolarAngle();

		minPolarAngle.value = currentPolarAngle;
		maxPolarAngle.value = currentPolarAngle + 0.00001;

		lastY.value = y.value;
	} else {
		minPolarAngle.value = -Infinity;
		maxPolarAngle.value = Infinity;
	}
});

watch([y, isZooming], ([newY, isZooming]) => {
	if (isZooming && cameraControls.value) {
		const deltaY = newY - lastY.value;

		// @ts-ignore types don't export instance
		cameraControls.value.instance.dolly(-(deltaY * 0.01));

		lastY.value = newY;
	}
});
</script>

<template>
	<TresPerspectiveCamera :position="[5, 5, 5]" />

	<CameraControls
		ref="cameraControls"
		:mouse-buttons="mouseButtons"
		:min-distance="1"
		:max-distance="20"
		:min-polar-angle="minPolarAngle"
		:max-polar-angle="maxPolarAngle"
		:azimuth-rotate-speed="0.3"
		:polar-rotate-speed="0.3"
		:smooth-time="0.1"
		:dragging-smooth-time="0.05"
	/>
</template>
