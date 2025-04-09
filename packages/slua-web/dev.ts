import { spawn } from 'child_process';
import { watch } from 'fs';

function build() {
	console.log('Building...');

	const build = spawn('bun', ['run', 'build.ts']);

	build.stdout.on('data', (data) => {
		console.log(data.toString());
	});

	build.stderr.on('data', (data) => {
		console.error(data.toString());
	});

	build.on('close', () => {
		console.log('Build complete');
	});
}

build();

console.log('Watching for changes...');

watch('./src', { recursive: true }, (eventType, filename) => {
	if (filename) {
		console.log(`File ${filename} changed`);

		build();
	}
});
