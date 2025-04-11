import { readdirSync, statSync } from "node:fs";
import { spawn } from "bun";

const tests: string[] = [];

function findTests(directory: string) {
	const entries = readdirSync(directory);

	for (const name of entries) {
		const fullPath = `${directory}/${name}`;

		if (statSync(fullPath).isFile()) {
			if (name.endsWith(".spec.luau")) {
				tests.push(fullPath);
			}
		} else if (statSync(fullPath).isDirectory()) {
			findTests(fullPath);
		}
	}
}

findTests("tests");

for (const test of tests) {
	const script = spawn({
		cmd: ["luau", test],
		stdio: ["ignore", "inherit", "inherit"],
	});

	const code = await script.exited;

	if (code !== 0) {
		throw new Error(`Test exited with code ${code}`);
	}
}
