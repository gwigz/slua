import { type BuildConfig, build, file, write } from 'bun';
import dts from 'bun-plugin-dts';

const defaultBuildConfig: BuildConfig = {
	entrypoints: ['./src/index.ts'],
	outdir: './dist',
};

await Promise.all([
	build({
		...defaultBuildConfig,
		plugins: [dts()],
		format: 'esm',
		naming: '[dir]/[name].js',
	}),
	build({
		...defaultBuildConfig,
		format: 'cjs',
		naming: '[dir]/[name].cjs',
	}),
]);

await write('./dist/luau.wasm', file('./src/luau/luau.wasm'));
