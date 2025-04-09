import path from 'node:path';
import { spawn } from 'bun';

const replacements = {
	local: 'relative',
	end: 'finish',
	vector: 'vec',
	quaternion: 'quat',
	uuid: 'key',
	number: 'num',
	integer: 'int',
};

export function simplifyArgName(name: string): string {
	let simplified = name.replace(/(?<!^)([A-Z][a-z]+)/g, '_$1').toLowerCase();

	// remove verbose prefixes
	simplified = simplified
		.replace(/^number_of_|^http_|^start_|^senders_/g, '')
		.replace(/id$/, 'id');

	// replace reserved words
	if (simplified in replacements) {
		return replacements[simplified];
	}

	return simplified;
}

const BIOME_PATH = path.resolve(
	path.join(import.meta.dir, '..', 'node_modules', '.bin', 'biome'),
);

export async function formatWithBiome(files: string[]) {
	const biome = spawn({
		cmd: [BIOME_PATH, 'check', '--write', ...files],
		stdio: ['ignore', 'pipe', 'inherit'],
	});

	const code = await biome.exited;

	if (code !== 0) {
		throw new Error(`Biome exited with code ${code}`);
	}
}
