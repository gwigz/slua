import initLuau from './luau/luau.js';

// @ts-ignore
import sandboxContent from './sandbox.luau' with { type: 'text' };

const internal = '__INTERNAL_DO_NOT_USE';

const sandbox = sandboxContent.replace(/internal/g, internal);

export type SLuaEvent = 'touch';

export type SLuaOutput = {
	timestamp: number;
	delta: number;
	type: number;
	name: string;
	data: string;
};

export type SLuaConfig = {
	sandbox?: string;

	onPrint?: (message: string) => void;
};

export type SLuaScript = {
	/**
	 * Calls a global function by name
	 *
	 * @param name - The name of the global function to call
	 * @param args - Array of arguments to pass to the function
	 */
	call: (name: string, args?: (string | number | boolean | null)[]) => string;

	/**
	 * Calls `touch_start`, `touch`, and `touch_end` functions in sequence.
	 */
	touch: (detected?: number) => void;

	/**
	 * Gets the value of a global variable by name
	 *
	 * @param name - The name of the global variable to get
	 * @returns The value of the global variable
	 */
	get: (name: string) => string | null;

	/**
	 * Sets the value of a global variable by name
	 *
	 * @param name - The name of the global variable to set
	 * @param value - The value to set the global variable to
	 */
	set: (name: string, value: string) => void;
};

export function parsePrint(message: string): SLuaOutput | undefined {
	if (!message.startsWith('#SLUA#\t')) {
		return;
	}

	const [_, timestamp, delta, type, name, data] = message.split('\t');

	return {
		timestamp: Number(timestamp),
		delta: Number(delta),
		type: Number(type),
		name,
		data,
	};
}

export async function runCode(code: string, config: SLuaConfig = {}) {
	const output: SLuaOutput[] = [];

	const luau = await initLuau({ print: config.onPrint ?? console.log });

	try {
		const err = luau.ccall(
			'executeScript',
			'string',
			['string'],
			[`${config.sandbox ?? sandbox}\n${code}`],
		);

		if (err && typeof err === 'string') {
			const sandboxLineCount = (config.sandbox ?? sandbox).split('\n').length;
			const errText = err.replace('stdin:', '');

			let errLineNo = Number(errText.match(/\d+/)?.[0]);

			if (errLineNo) {
				errLineNo -= sandboxLineCount;

				// hack to work around our sandbox wrapper
				// may result in unexpected results if `error()` is used in their code?
				const adjustedErrText = errText
					// replace "X:" format
					.replace(/(\d+):/, `${errLineNo}:`)
					// replace "at line X" format
					.replace(
						/at line (\d+)/,
						(_, lineNumber) =>
							`at line ${Number(lineNumber) - sandboxLineCount}`,
					)
					// replace "stack backtrace:\n\d+"
					.replace(
						/stack backtrace:\n(\d+)/g,
						(_, lineNumber) =>
							`stack backtrace:\n${Number(lineNumber) - sandboxLineCount}`,
					)
					.replace(", got '__INTERNAL_DO_NOT_USE'", '')
					.replace(/__INTERNAL_DO_NOT_USE/g, 'internal');

				output.push({
					timestamp: Date.now(),
					delta: Number.MAX_SAFE_INTEGER,
					type: 0,
					name: 'Script Error',
					data: adjustedErrText,
				});
			} else {
				output.push({
					timestamp: Date.now(),
					delta: Number.MAX_SAFE_INTEGER,
					type: 0,
					name: 'Script Error',
					data: errText,
				});
			}
		}
	} catch (error) {
		output.push({
			timestamp: Date.now(),
			delta: Number.MAX_SAFE_INTEGER,
			type: 0,
			name: 'Script Error',
			data: error instanceof Error ? error.message : String(error),
		});
	}

	const call: SLuaScript['call'] = (name, args) =>
		luau.ccall(
			'executeGlobalFunction',
			'string',
			['string', 'string'],
			[name, ''], // args ?? ''],
		);

	// these are custom functions, not part of the normal Luau.Web.js API
	const script: SLuaScript = {
		call,
		touch: (detected?: number) => call(`${internal}.touch`, [detected ?? 1]),
		get: (name: string) => null,
		set: (name: string, value: string) => {},
	};

	return { script, output };
}

export default { runCode, parsePrint };
