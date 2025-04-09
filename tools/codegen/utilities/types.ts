export type Type = string | string[] | { value: string }[];

interface Arg {
	def: string;
	name: string;
	desc: string;
	type: Type;
	variadic: boolean;
	optional: boolean;
}

interface Result {
	name: string;
	def: string;
	desc: string;
	variadic: boolean;
	type: Type;
	optional: boolean;
}

export interface Signature {
	result: Result[];
	args: Arg[];
}

interface Prop {
	def: string;
	name: string;
	energy?: number;
	pure?: boolean;
	sleep?: number;
	signatures?: Signature[];
	desc?: string;
	link?: string;
	props?: Record<string, Prop>;
	value?: string | number | null;
	type?: string | { value: string } | { custom: string };
}

interface Global {
	def: string;
	name: string;
	props: Record<string, Prop>;
}

export type Keywords = {
	global: Global;
	[key: string]: unknown;
};
