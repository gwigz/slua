// biome-ignore-all lint/suspicious/noExplicitAny: shrugs
declare namespace RuntimeExports {
	function ccall(
		ident: any,
		returnType?: (string | null) | undefined,
		argTypes?: any[] | undefined,
		args?: any[] | undefined,
		opts?: any | undefined,
	): any;

	function cwrap(
		ident: any,
		returnType?: string | undefined,
		argTypes?: any[] | undefined,
		opts?: any | undefined,
	): (...args: any[]) => any;

	let HEAPF32: any;
	let HEAPF64: any;
	let HEAP_DATA_VIEW: any;
	let HEAP8: any;
	let HEAPU8: any;
	let HEAP16: any;
	let HEAPU16: any;
	let HEAP32: any;
	let HEAPU32: any;
	let HEAP64: any;
	let HEAPU64: any;
}

interface WasmModule {
	_executeScript(_0: number): number;
	_executeGlobalFunction(_0: number, _1: number): number;
}

export type LuauModule = WasmModule & typeof RuntimeExports;

export default function LuauModuleFactory(
	options?: unknown,
): Promise<LuauModule>;
