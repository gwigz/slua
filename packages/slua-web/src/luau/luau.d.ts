/// <reference types="emscripten" />
/** biome-ignore-all lint/suspicious/noExplicitAny: idk */

type EmbindString =
	| ArrayBuffer
	| Uint8Array
	| Uint8ClampedArray
	| Int8Array
	| string;

interface WasmModule extends EmscriptenModule {
	/**
	 * Call a C function by name.
	 *
	 * @param ident - The name of the C function to call
	 * @param returnType - The return type of the C function
	 * @param argTypes - Array of argument types
	 * @param args - Array of arguments to pass to the function
	 * @param opts - Additional options
	 * @link https://emscripten.org/docs/api_reference/preamble.js.html#ccall
	 */
	ccall: typeof ccall;

	/**
	 * Wrap a C function in a JavaScript function.
	 *
	 * @param ident - The name of the C function to wrap
	 * @param returnType - The return type of the C function
	 * @param argTypes - Array of argument types
	 * @param opts - Additional options
	 * @link https://emscripten.org/docs/api_reference/preamble.js.html#cwrap
	 */
	cwrap: typeof cwrap;

	/**
	 * Runs Luau code on this instance.
	 *
	 * @param code - The Luau code to run
	 * @returns Error, if any
	 */
	runScript(code: EmbindString): unknown;

	/**
	 * Calls a global function by name.
	 *
	 * @param name - The name of the global function to call
	 * @param args - The arguments to pass to the function
	 * @returns The result of the function call, or error
	 */
	callGlobalFunction(name: EmbindString, args: EmbindString): string;

	/**
	 * Callback handler for `__INTERNAL_DO_NOT_USE_calljs(method, data)`.
	 *
	 * @param method - The method name
	 * @param json - The related arguments
	 * @returns The result of the read, or error
	 */
	readSync(method: EmbindString, json: EmbindString): string;
}

declare const LuauModule: EmscriptenModuleFactory<WasmModule>;

export default LuauModule;
