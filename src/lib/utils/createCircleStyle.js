import { scaleSqrt } from 'd3-scale';

function genGradient (extent, fieldName, bins) {
	const spread = extent[1] - extent[0];

	const list = [];
	for (let i = 0; i < bins.length; i += 1) {
		list.push(extent[0] + spread * i / (bins.length - 1), bins[i]);
	}
	return [
		'interpolate',
		['linear'],
		['get', fieldName],
		...list
	];
}

function genRadius (extent, fieldName, rRange, bins = [0, 1, 2, 3, 4, 6, 7]) {
	const scale = scaleSqrt().domain(extent).range(rRange);
	const spread = extent[1] - extent[0];

	const list = [];
	for (let i = 0; i < bins.length; i += 1) {
		const input = extent[0] + spread * i / (bins.length - 1);
		const output = scale(input);
		list.push(input, output);
	}
	return [
		'interpolate',
		['linear'],
		['get', fieldName],
		...list
	];
}

export default function createCircleStyle (color, radius, constantR, { rRange, colorByScheme }) {
	console.log(color, radius, constantR, { rRange, colorByScheme });
	const baseRadius = {
		base: 1.75,
		stops: [
			[3, 2],
			[15, 180],
		]
	};
	return {
		'circle-stroke-color': '#000',
		'circle-stroke-width': 1,
		'circle-radius': constantR ? baseRadius : genRadius(radius.domain, radius.key, rRange),
		'circle-color': genGradient(color.domain, color.key, colorByScheme),
		'circle-opacity': 0.6
	};
}
