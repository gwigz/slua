import { readdirSync, statSync } from "node:fs";
import { spawn } from "bun";

type TestResult = {
	name: string;
	status: "passed" | "failed";
	duration: number;
	errors: string[];
};

const results = {
	results: {
		tool: {
			name: "@gwigz/slua-web",
			version: "0.0.1",
		},
		summary: {
			tests: 0,
			passed: 0,
			failed: 0,
			skipped: 0,
		},
		tests: [] as TestResult[],
	},
};

function findTests(directory: string): string[] {
	const tests: string[] = [];
	const entries = readdirSync(directory);

	for (const name of entries) {
		const fullPath = `${directory}/${name}`;
		if (statSync(fullPath).isFile() && name.endsWith(".spec.luau")) {
			tests.push(fullPath);
		} else if (statSync(fullPath).isDirectory()) {
			tests.push(...findTests(fullPath));
		}
	}

	return tests;
}

function parseErrors(output: string): string[] {
	const errors: string[] = [];
	const lines = output.split("\n");

	for (let i = lines.length - 1; i >= 0; i--) {
		if (lines[i].includes("FAIL")) {
			let error = lines[i].replace(/\x1b\[[0-9;]*m/g, "").trim();

			if (i + 1 < lines.length && lines[i + 1].includes("expected")) {
				error +=
					"\n" +
					lines[i + 1]
						.replace(/\x1b\[[0-9;]*m/g, "")
						.replace("./tests/sandbox/", "")
						.trim();
			}

			errors.push(error);
		}
	}

	return errors;
}

let hasError = false;

for (const test of findTests("tests")) {
	let stdout = "";
	const script = spawn({
		cmd: ["luau", test],
		stdio: ["ignore", "pipe", "inherit"],
	});

	script.stdout.pipeTo(
		new WritableStream({
			write(chunk) {
				const text = new TextDecoder().decode(chunk);
				process.stdout.write(chunk);
				stdout += text;
			},
		})
	);

	await script.exited;
	const errors = parseErrors(stdout);

	const testResult = {
		name: test,
		status: errors.length === 0 ? "passed" : "failed",
		duration: 0,
		errors,
	} satisfies TestResult;

	results.results.tests.push(testResult);
	results.results.summary.tests++;

	if (errors.length === 0) {
		results.results.summary.passed++;
	} else {
		results.results.summary.failed++;
		hasError = true;
	}
}

await Bun.write("test-results.json", JSON.stringify(results, null, 2));

if (hasError) {
	process.exit(1);
}
