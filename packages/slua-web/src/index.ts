import initLuau from './luau/luau.js';

// @ts-ignore
import sandboxContent from './sandbox.luau' with { type: 'text' };

const INTERNAL = '__INTERNAL_DO_NOT_USE';
const SANDBOX = sandboxContent.replace(/internal/g, INTERNAL);

type JsonLuaArgs = (string | number | boolean | null) | JsonLuaArgs[];

export const ChatType = {
	UNKNOWN: 0,
	DEBUG: 1,
	OWNER: 2,
	WHISPER: 3,
	SAY: 4,
	SHOUT: 5,
	REGION: 6,
	INSTANT_MESSAGE: 7,
} as const;

export type ChatType = (typeof ChatType)[keyof typeof ChatType];

export type SLuaOutput = {
	timestamp: number;
	delta: number;
	type: ChatType;
	name: string;
	data: string;
};

export type SLuaError = SLuaOutput & {
	line?: number;
};

export type SLuaConfig = {
	sandbox?: string;

	/**
	 * Returns runtime print statements (from i.e. using `print()` in your Luau script)
	 */
	onPrint?: (message: string[]) => void;

	/**
	 * Returns runtime errors (from i.e. using `script.call()` or `error()`)
	 */
	onError?: (error: SLuaError) => void;

	/**
	 * Returns runtime chat messages
	 */
	onChat?: (message: SLuaOutput) => void;

	/**
	 * Returns runtime timer interval changes (zero means the timer is stopped)
	 */
	onTimerChange?: (interval: number) => void;

	/**
	 * Returns runtime position changes
	 */
	onPositionChange?: (link: number, position: [number, number, number]) => void;

	/**
	 * Returns runtime position changes
	 */
	onRotationChange?: (
		link: number,
		rotation: [number, number, number, number],
	) => void;

	/**
	 * Returns runtime scale changes
	 */
	onScaleChange?: (link: number, scale: [number, number, number]) => void;

	/**
	 * Returns runtime color changes
	 */
	onColorChange?: (
		link: number,
		color: [number, number, number],
		face: number,
	) => void;

	/**
	 * Returns runtime glow changes
	 */
	onGlowChange?: (link: number, glow: number, face: number) => void;

	/**
	 * Returns runtime alpha changes
	 */
	onAlphaChange?: (link: number, alpha: number, face: number) => void;
};

export type SLuaScript = {
	/**
	 * Calls a global function by name, can target tables by using dot notation.
	 *
	 * @param name - The name of the global function to call
	 * @param args - Array of arguments to pass to the function
	 * @throws Error if the function call fails
	 */
	call: (name: string, args?: JsonLuaArgs[]) => void;

	/**
	 * Calls `attach` event handler.
	 */
	attach: (key: string) => void;

	/**
	 * Calls `at_rot_target` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	atRotTarget: (
		handle: number,
		rotation: [number, number, number, number],
		ourRotation: [number, number, number, number],
	) => void;

	/**
	 * Calls `at_target` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	atTarget: (
		handle: number,
		position: [number, number, number],
		ourPosition: [number, number, number],
	) => void;

	/**
	 * Calls `collision_start`, `collision`, and `collision_end` event handlers in sequence.
	 *
	 * @throws Error if the function call fails
	 */
	collision: (detected?: number) => void;

	/**
	 * Calls `changed` event handlers in sequence.
	 *
	 * @throws Error if the function call fails
	 */
	changed: (change?: number) => void;

	/**
	 * Calls `control` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	control: (id: string, level: number, edge: number) => void;

	/**
	 * Calls `dataserver` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	dataserver: (id: string, data: string) => void;

	/**
	 * Calls `email` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	email: (
		time: string,
		address: string,
		subject: string,
		message: string,
		numLeft: number,
	) => void;

	/**
	 * Calls `experience_permissions` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	experiencePermissions: (id: string) => void;

	/**
	 * Calls `experience_permissions_denied` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	experiencePermissionsDenied: (id: string, reason: number) => void;

	/**
	 * Calls `final_damage` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	finalDamage: (detected?: number) => void;

	/**
	 * Calls `game_control` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	gameControl: (id: string, levels: number, axis: number[]) => void;

	/**
	 * Calls `http_request` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	httpRequest: (id: string, method: string, body: string) => void;

	/**
	 * Calls `http_response` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	httpResponse: (
		id: string,
		status: number,
		metadata: number[],
		body: string,
	) => void;

	/**
	 * Calls `land_collision` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	landCollision: (position: [number, number, number]) => void;

	/**
	 * Calls `linkset_data` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	linksetData: (action: number, key: string, value: string) => void;

	/**
	 * Calls `link_message` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	linkMessage: (
		sender: number,
		integer: number,
		data: string,
		key: string,
	) => void;

	/**
	 * Calls `listen` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	listen: (channel: number, name: string, key: string, message: string) => void;

	/**
	 * Calls `money` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	money: (key: string, amount?: number) => void;

	/**
	 * Calls `moving_start` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	movingStart: () => void;

	/**
	 * Calls `moving_end` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	movingEnd: () => void;

	/**
	 * Calls `not_at_rot_target` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	notAtRotTarget: () => void;

	/**
	 * Calls `not_at_target` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	notAtTarget: () => void;

	/**
	 * Calls `no_sensor` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	noSensor: () => void;

	/**
	 * Calls `object_rez` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	objectRez: (key?: string) => void;

	/**
	 * Calls `on_damage` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	onDamage: (damage?: number) => void;

	/**
	 * Calls `on_death` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	onDeath: () => void;

	/**
	 * Calls `on_rez` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	onRez: (param?: number) => void;

	/**
	 * Calls `path_update` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	pathUpdate: (type: number, reserved?: (string | number)[]) => void;

	/**
	 * Calls `run_time_permissions` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	runTimePermissions: (permissions?: number) => void;

	/**
	 * Calls `sensor` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	sensor: (detected?: number) => void;

	/**
	 * Calls `timer` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	timer: () => void;

	/**
	 * Calls `touch_start`, `touch`, and `touch_end` event handlers in sequence.
	 *
	 * @throws Error if the function call fails
	 */
	touch: (detected?: number) => void;

	/**
	 * Calls `transaction_result` event handler.
	 *
	 * @throws Error if the function call fails
	 */
	transactionResult: (id: string, success: number, data: string) => void;

	/**
	 * Gets the value of a global variable by name
	 *
	 * @param name - The name of the global variable to get
	 * @returns The value of the global variable
	 * @note Not implemented yet
	 */
	get: (name: string) => string | null;

	/**
	 * Sets the value of a global variable by name
	 *
	 * @param name - The name of the global variable to set
	 * @param value - The value to set the global variable to
	 * @note Not implemented yet
	 */
	set: (name: string, value: string) => void;

	/**
	 * Disposes the SLua runtime
	 */
	dispose: () => void;
};

function parseChat(message: string): SLuaOutput {
	const [_, timestamp, delta, type, name, data] = message.split('\t');

	let chatType = Number(type) as ChatType;

	if (chatType < 0 || chatType > 7) {
		chatType = ChatType.UNKNOWN;
	}

	return {
		timestamp: Number(timestamp),
		delta: Number(delta),
		type: chatType,
		name,
		data,
	};
}

type Config = Required<Omit<SLuaConfig, 'sandbox'>>;

type CallbackParameters<T extends keyof Config> = Parameters<
	NonNullable<Config[T]>
>;

function parsePositionChange(
	message: string,
): CallbackParameters<'onPositionChange'> {
	const [_, link, x, y, z] = message.split('\t');

	return [Number(link), [Number(x), Number(y), Number(z)]];
}

function parseScaleChange(
	message: string,
): CallbackParameters<'onScaleChange'> {
	const [_, link, x, y, z] = message.split('\t');

	return [Number(link), [Number(x), Number(y), Number(z)]];
}

function parseRotationChange(
	message: string,
): CallbackParameters<'onRotationChange'> {
	const [_, link, x, y, z, w] = message.split('\t');

	return [Number(link), [Number(x), Number(y), Number(z), Number(w)]];
}

function parseColorChange(
	message: string,
): CallbackParameters<'onColorChange'> {
	const [_, link, x, y, z, face] = message.split('\t');

	return [Number(link), [Number(x), Number(y), Number(z)], Number(face)];
}

function parseAlphaChange(
	message: string,
): CallbackParameters<'onAlphaChange'> {
	const [_, link, alpha, face] = message.split('\t');

	return [Number(link), Number(face), Number(alpha)];
}

function luaFormat(value: unknown): string {
	if (typeof value === 'string') {
		return JSON.stringify(value);
	}

	if (typeof value === 'number') {
		return String(value);
	}

	if (typeof value === 'boolean') {
		return value ? 'true' : 'false';
	}

	if (typeof value === 'object' && value !== null) {
		if (Array.isArray(value)) {
			return `{ ${value.map(luaFormat).join(', ')} }`;
		}

		return `{ ${Object.entries(value)
			.map(([key, value]) => `"${key}" = ${luaFormat(value)}`)
			.join(', ')} }`;
	}

	return 'nil';
}

/**
 * Starts a new SLua runtime and executes the given code.
 *
 * Any prints or errors that happen during initial execution are returned,
 * later prints or errors can be returned via the `onPrint` or `onError`
 * callbacks.
 */
export async function runScript(code: string, config: SLuaConfig = {}) {
	const errors: SLuaError[] = [];

	let timer: Timer | undefined;

	const sandboxLineCount = (config.sandbox ?? SANDBOX).split('\n').length;

	function parseErrorMessage(message: string) {
		const errLineNo = message.match(/(^\d+|stdin:\d+):/)?.[0]?.replace(/^(\d+|stdin:)(\d+):/, '$2');

		// hack to work around our sandbox wrapper
		// may result in unexpected results if `error()` is used in their code?
		const errorText = message
			// replace "stdin:X" format
			.replace(/^stdin:(\d+)/,
				(_, lineNumber) =>
					`stdin:${Number(lineNumber) - sandboxLineCount}`,
			)
			// replace " at line X)" format
			.replace(
				/ at line (\d+)\)/,
				(_, lineNumber) =>
					` at line ${Number(lineNumber) - sandboxLineCount})`,
			)
			// replace "stack backtrace:\n\d+"
			.replace(
				/stack backtrace:\n(\d+)/g,
				(_, lineNumber) =>
					`stack backtrace:\n${Number(lineNumber) - sandboxLineCount}`,
			)
			.replace(", got '__INTERNAL_DO_NOT_USE'", '')
			.replace(/__INTERNAL_DO_NOT_USE/g, 'internal');

		return {
			timestamp: Date.now(),
			delta: Number.MAX_SAFE_INTEGER,
			type: ChatType.DEBUG,
			name: 'Script Error',
			data: errorText,
			line: errLineNo ? Number(errLineNo) : undefined,
		};
	}

	const luau = await initLuau({
		print: (message: string) => {
			switch (true) {
				case message.startsWith('#!SLUA:CHAT'):
					config.onChat?.(parseChat(message));
					break;

				case message.startsWith('#!SLUA:SET_TIMER'): {
					const interval = Number(message.split('\t')[1]);

					if (interval === 0 || interval < 0) {
						clearInterval(timer);
					} else {
						timer = setInterval(
							() => call('timer', []),
							Math.max(0.02, interval) * 1000,
						);
					}

					config.onTimerChange?.(interval);
					break;
				}

				case message.startsWith('#!SLUA:SET_POSITION'):
					config.onPositionChange?.(...parsePositionChange(message));
					break;

				case message.startsWith('#!SLUA:SET_SCALE'):
					config.onScaleChange?.(...parseScaleChange(message));
					break;

				case message.startsWith('#!SLUA:SET_ROTATION'):
					config.onRotationChange?.(...parseRotationChange(message));
					break;

				case message.startsWith('#!SLUA:SET_COLOR'):
					config.onColorChange?.(...parseColorChange(message));
					break;

				case message.startsWith('#!SLUA:SET_ALPHA'):
					config.onAlphaChange?.(...parseAlphaChange(message));
					break;

				default:
					(config.onPrint ?? console.log)(...message.split('\t'));
					break;
			}
		},
		printErr: (message: string) => {
			(config.onError ?? console.error)(parseErrorMessage(message));
		},
		readSync: (method: string, json: string) => {
			switch (method) {
				case 'JSON.stringify':
					return `return ${luaFormat(JSON.parse(json))}`;
				case 'JSON.decode':
					return `return ${luaFormat(JSON.parse(JSON.parse(json)))}`;
				case 'btoa':
					return `return "${btoa(JSON.parse(json))}"`;
				case 'atob':
					return `return "${atob(JSON.parse(json))}"`;
				default:
					return '';
			}
		},
	});

	try {
		const err = luau.runScript(`${config.sandbox ?? SANDBOX}\n${code}`);

		if (err && typeof err === 'string') {
			errors.push(parseErrorMessage(err));
		}
	} catch (error) {
		errors.push(parseErrorMessage(error instanceof Error ? error.message : String(error)));
	}

	const call: SLuaScript['call'] = (name, args) => {
		const error = luau.callGlobalFunction(name, args ? JSON.stringify(args) : '[]');

		if (error && error !== 'nil') {
			(config.onError ?? console.error)(parseErrorMessage(error));
		}
	}

	// these are custom functions, not part of the normal Luau.Web.js API
	const script: SLuaScript = {
		call,

		attach: (key: string) => call(`${INTERNAL}.attach`, [key]),

		atRotTarget: (
			handle: number,
			rotation: [number, number, number, number],
			ourRotation: [number, number, number, number],
		) => call(`${INTERNAL}.at_rot_target`, [handle, rotation, ourRotation]),

		atTarget: (
			handle: number,
			position: [number, number, number],
			ourPosition: [number, number, number],
		) => call(`${INTERNAL}.at_target`, [handle, position, ourPosition]),

		collision: (detected?: number) =>
			call(`${INTERNAL}.collision`, [detected ?? 1]),

		changed: (change?: number) => call(`${INTERNAL}.changed`, [change ?? 0]),

		control: (id: string, level: number, edge: number) =>
			call(`${INTERNAL}.control`, [id, level, edge]),

		dataserver: (id: string, data: string) =>
			call(`${INTERNAL}.dataserver`, [id, data]),

		email: (
			time: string,
			address: string,
			subject: string,
			message: string,
			numLeft: number,
		) => call(`${INTERNAL}.email`, [time, address, subject, message, numLeft]),

		experiencePermissions: (id: string) =>
			call(`${INTERNAL}.experience_permissions`, [id]),

		experiencePermissionsDenied: (id: string, reason: number) =>
			call(`${INTERNAL}.experience_permissions_denied`, [id, reason]),

		finalDamage: (detected?: number) =>
			call(`${INTERNAL}.final_damage`, [detected ?? 1]),

		gameControl: (id: string, levels: number, axis: number[]) =>
			call(`${INTERNAL}.game_control`, [id, levels, axis]),

		httpRequest: (id: string, method: string, body: string) =>
			call(`${INTERNAL}.http_request`, [id, method, body]),

		httpResponse: (
			id: string,
			status: number,
			metadata: number[],
			body: string,
		) => call(`${INTERNAL}.http_response`, [id, status, metadata, body]),

		landCollision: (position: [number, number, number]) =>
			call(`${INTERNAL}.land_collision`, [position]),

		linksetData: (action: number, key: string, value: string) =>
			call(`${INTERNAL}.linkset_data`, [action, key, value]),

		linkMessage: (sender: number, integer: number, data: string, key: string) =>
			call(`${INTERNAL}.link_message`, [sender, integer, data, key]),

		listen: (channel: number, name: string, key: string, message: string) =>
			call(`${INTERNAL}.listen`, [channel, name, key, message]),

		money: (key: string, amount?: number) =>
			call(`${INTERNAL}.money`, [key, amount ?? 0]),

		movingStart: () => call(`${INTERNAL}.moving_start`),

		movingEnd: () => call(`${INTERNAL}.moving_end`),

		notAtRotTarget: () => call(`${INTERNAL}.not_at_rot_target`),

		notAtTarget: () => call(`${INTERNAL}.not_at_target`),

		noSensor: () => call(`${INTERNAL}.no_sensor`),

		objectRez: (key?: string) => call(`${INTERNAL}.object_rez`, [key ?? '']),

		onDamage: (damage?: number) => call(`${INTERNAL}.on_damage`, [damage ?? 1]),

		onDeath: () => call(`${INTERNAL}.on_death`),

		onRez: (param?: number) => call(`${INTERNAL}.on_rez`, [param ?? 0]),

		pathUpdate: (type: number, reserved?: (string | number)[]) =>
			call(`${INTERNAL}.path_update`, [type, reserved ?? []]),

		runTimePermissions: (permissions?: number) =>
			call(`${INTERNAL}.run_time_permissions`, [permissions ?? 0]),

		sensor: (detected?: number) => call(`${INTERNAL}.sensor`, [detected ?? 1]),

		timer: () => call(`${INTERNAL}.timer`),

		touch: (detected?: number) => call(`${INTERNAL}.touch`, [detected ?? 1]),

		transactionResult: (id: string, success: number, data: string) =>
			call(`${INTERNAL}.transaction_result`, [id, success, data]),

		// utilities
		get: (name: string) => null,
		set: (name: string, value: string) => {},
		dispose: () => clearInterval(timer),
	};

	return { script, errors };
}

export default { runScript };
