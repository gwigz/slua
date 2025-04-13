import { readdirSync, statSync } from "node:fs";
import { spawn, randomUUIDv7 } from "bun";

type TestResult = {
	name: string;
	status: "passed" | "failed" | "skipped" | "pending" | "other";
	duration: number;
	stderr: string[];
	filepath: string;
};

const results = {
	$schema:
		"https://ctrf.io/assets/files/ctrf-schema-0beba8f9f2920d3af19c031b04adb9b6.json",
	reportFormat: "CTRF",
	specVersion: "0.0.0",
	reportId: randomUUIDv7(),
	timestamp: new Date().toISOString(),
	results: {
		tool: {
			name: "@gwigz/slua-web",
			version: "0.0.1",
		},
		summary: {
			start: Date.now(),
			stop: 0,
			tests: 0,
			passed: 0,
			failed: 0,
			skipped: 0,
			pending: 0,
			other: 0,
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
						// .replace(/\x1b\[[0-9;]*m/g, "")
						.replace("./tests/sandbox/", "")
						.trim();
			}

			errors.push(error);
		}
	}

	if (errors.length === 0 && !output.includes("PASS")) {
		errors.push("Something went wrong, no tests passed");
	}

	return errors;
}

let hasError = false;

for (const test of findTests("tests")) {
	let stdout = "";
	let errors = [];
	let start = Date.now();

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

	if (!(await script.exited)) {
		errors.push(
			`\`${test.replace("tests/sandbox/", "")}\` failed unexpectedly`
		);
	} else {
		errors.push(...parseErrors(stdout));
	}

	const testResult = {
		name: test.replace("tests/sandbox/", ""),
		status: errors.length === 0 ? "passed" : "failed",
		duration: Date.now() - start,
		filepath: `./packages/slua-web/${test}`,
		stderr: errors,
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

results.results.summary.stop = Date.now();

await Bun.write("test-results.json", JSON.stringify(results, null, 2));

if (hasError) {
	process.exit(1);
}
