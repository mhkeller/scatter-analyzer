<script>
	import { onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';

	import TooltipBody from './TooltipBody.svelte';

	import createCircleStyle from '../utils/createCircleStyle.js';
	import { filterObject } from '../utils/helpers.js';

	/** @type {String} */
	export let colorKey;
	/** @type {String} */
	export let rKey;
	/** @type {Number[]} */
	export let colorExtent;
	/** @type {Number[]} */
	export let rExtent;
	/** @type {Boolean} */
	export let constantR;
	/** @type {Boolean} */
	export let rRange;
	/** @type {Boolean} */
	export let colorByScheme;

	/** @type {String} */
	export let lngKey = 'lng';
	/** @type {String} */
	export let latKey = 'lat';

	/** @type {Object[]} */
	export let features;
	/** @type {String[]} */
	export let tooltipKeys;
	/** @type {String[]} */
	export let accessToken;

	let map;
	let mapLoaded = false;
	let layerId = 'my-layer';
	let geoJsonLayerId = 'geojson-layer';
	let tooltipEl;
	let showTooltipEl = false;
	let tooltipFeatures = [];

	$: if (mapLoaded && features && colorExtent && colorKey && rExtent && rKey) {
		const geojson = features.map(d => {
			return {
				type: 'Feature',
				properties: filterObject(d, tooltipKeys),
				geometry: {
					type: 'Point',
					coordinates: [+d[lngKey], +d[latKey]]
				}
			};
		});
		const data = {
			type: 'FeatureCollection',
			features: geojson
		};
		// console.log('geojson features', geojson);
		const hasLayer = mapHasLayer(layerId);
		if (hasLayer) {
			map.getSource(geoJsonLayerId).setData(data);
			// console.log(colorExtent, colorKey, rExtent, rKey);
			const newCircleStyle = createCircleStyle({ domain: colorExtent, key: colorKey }, { domain: rExtent, key: rKey }, constantR, { rRange, colorByScheme })
			map.setPaintProperty(layerId, 'circle-color',	newCircleStyle['circle-color']);
			map.setPaintProperty(layerId, 'circle-radius',	newCircleStyle['circle-radius']);
		} else {
			map.addSource(geoJsonLayerId, {
				type: 'geojson',
				data
			});
			map.addLayer({
					id: layerId,
					type: 'circle',
					source: geoJsonLayerId,
					paint: createCircleStyle({ domain: colorExtent, key: colorKey }, { domain: rExtent, key: rKey }, constantR, { rRange, colorByScheme })
			});
		}
	}

	/* --------------------------------------------
		* Create map
		*/
	onMount(() => {
		mapboxgl.accessToken = accessToken;

		// mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
		map = new mapboxgl.Map({
			container: 'map-el',
			style: 'mapbox://styles/mapbox/streets-v9',
				// TODO, make this customizable
				zoom: 3,
				center: [-100.2440142, 40.1643667]
		});

		map.on('load', () => {
			mapLoaded = true;
			const tooltip = new mapboxgl.Marker(tooltipEl, {
				offset: [0, 0]
			}).setLngLat([0, 0]).addTo(map);

			map.on('mousemove', (e) => {
				const features = map.queryRenderedFeatures(e.point).filter(i => i.layer.id === layerId);
				tooltip.setLngLat(e.lngLat);
				map.getCanvas().style.cursor = features.length ? 'pointer' : '';
				tooltipFeatures = features;
			});


			map.on('mouseover', showTooltip(true));
			map.on('mouseout', showTooltip(false));

		});

	});

	function mapHasLayer(id) {
		return map
			.getStyle()
			.layers.map(i => i.id)
			.includes(id);
	}

	function showTooltip (tooltipStatus) {
		return () => {
			showTooltipEl = tooltipStatus;
		};
	}

</script>

<style>
	#map-el {
		overflow: visible !important;
	}
	.map-container {
		flex: 1;
		width: 100%;
		height: 100%;
		/* overflow: visible; */
	}
	.map {
		width: 100%;
		height: 100%;
		border-right: 5px solid #fff;
	}
	.tooltip {
		pointer-events: none;
		position: absolute;
	}

</style>

<svelte:head>
	<link href='https://api.mapbox.com/mapbox-gl-js/v2.1.1/mapbox-gl.css' rel='stylesheet' />

</svelte:head>

<div class="map-container">
	<div id="map-el" class="map"></div>
	<div id="huh"></div>
	<div bind:this={tooltipEl} class="tooltip" style="display: {showTooltipEl ? 'block' : 'none'}">
		{#if tooltipFeatures.length > 0}
			<TooltipBody {tooltipFeatures}/>
		{/if}
	</div>
</div>
