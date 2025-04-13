import { readdirSync, statSync } from "node:fs";
import { spawn, randomUUIDv7 } from "bun";

type TestResult = {
	name: string;
	suite: string;
	status: "passed" | "failed" | "skipped" | "pending" | "other";
	/** total milliseconds */
	duration: number;
	message?: string;
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

async function runTest(test: string): Promise<void> {
	let currentSuite: string[] = [];

	const script = spawn({
		cmd: ["luau", test],
		stdio: ["ignore", "pipe", "inherit"],
	});

	const decoder = new TextDecoder();
	const reader = script.stdout.getReader();

	while (true) {
		const { done, value } = await reader.read();

		if (done) {
			break;
		}

		const text = decoder.decode(value);
		const lines = text.split("\n");

		console.log(text);

		for (const line of lines) {
			const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, "").trim();

			if (!cleanLine) {
				continue;
			}

			// hacky, but it works for now
			const indentLevel = line.search(/\S/);

			if (!cleanLine.startsWith("PASS") && !cleanLine.startsWith("FAIL")) {
				if (indentLevel === 0) {
					currentSuite = [cleanLine];
				} else if (indentLevel === 4) {
					if (currentSuite.length > 0) {
						currentSuite = [currentSuite[0], cleanLine.trim()];
					}
				} else if (indentLevel === 8) {
					if (currentSuite.length > 1) {
						currentSuite = [currentSuite[0], currentSuite[1], cleanLine.trim()];
					}
				}
			} else if (cleanLine.includes("PASS") || cleanLine.includes("FAIL")) {
				const testName = cleanLine
					.replace(/^(PASS|FAIL)\s+/, "") // remove status
					.replace(/\s+\(\d+\.\d+s\)$/, "") // remove duration
					.trim();

				const status = cleanLine.includes("PASS") ? "passed" : "failed";
				const durationMatch = cleanLine.match(/\((\d+\.\d+)s\)$/);

				const testDuration = durationMatch
					? parseFloat(durationMatch[1]) * 1000
					: 0;

				const testResult: TestResult = {
					name: testName,
					suite: currentSuite[0],
					status,
					duration: testDuration,
					filepath: `./packages/slua-web/${test}`,
					message:
						status === "failed"
							? cleanLine.replace(durationMatch?.[0] ?? "", "").trim()
							: undefined,
				};

				results.results.tests.push(testResult);
				results.results.summary.tests++;
				results.results.summary[status]++;

				if (status === "failed") {
					process.exitCode = 1;
				}
			}
		}
	}
}

for (const test of findTests("tests")) {
	await runTest(test);
}

results.results.summary.stop = Date.now();

await Bun.write("test-results.json", JSON.stringify(results, null, 2));
