export function cn(...classes: (string | boolean | undefined | null)[]) {
	let i = 0,
		tmp: (typeof classes)[number],
		str = '',
		len = classes.length;

	for (; i < len; i++) {
		// biome-ignore lint/suspicious/noAssignInExpressions: :3
		if ((tmp = classes[i])) {
			if (typeof tmp === 'string') {
				str += (str && ' ') + tmp;
			}
		}
	}

	return str;
}
