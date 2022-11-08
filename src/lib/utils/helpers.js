import { format, precisionFixed } from 'd3-format';
import { commas } from 'yootils';

export function formatField(field) {
	return field.replace(/_/g, ' ').replace(/^\w/, d => d.toUpperCase());
}

export function formatNumber(d) {
	const p = precisionFixed(d || 0);
	const f = format(',.' + p + 'f');
	return f(d);
}

export function formatNumber2(d) {
	if (typeof d === 'string') return d;
	if (!d && d !== 0) return '';
	if (isNaN(d.toFixed(2))) return NaN;
	if (d % 1 === 0) return commas(d);
	return d.toFixed(2);
}

export function filterObject(obj, keyList) {
	if (!Array.isArray(keyList)) return obj;
	return Object.fromEntries(Object.entries(obj).filter(([key]) => {
		return keyList.includes(key)
	}));
}
