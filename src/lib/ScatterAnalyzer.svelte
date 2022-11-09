<script>
	import { LayerCake, Svg, Html, Canvas } from 'layercake';
	import { extent } from 'd3-array';
	import { quantileRank } from 'simple-statistics';
	import { scaleLog, scaleLinear, scaleOrdinal, scaleSequential } from 'd3-scale';
	import { interpolateYlGnBu } from 'd3-scale-chromatic';

	import DoubleRangeSlider from './components/DoubleRangeSlider.svelte';
	import MapboxMap from './components/MapboxMap.svelte';
	import ScatterCanvas from './components/Scatter.canvas.svelte';
	import AxisX from './components/AxisX.svelte';
	import AxisY from './components/AxisY.svelte';
	import QuadTree from './components/QuadTree.svelte';

	import { formatField, formatNumber, formatNumber2 } from './utils/helpers.js';

	const sequentialColorScale = scaleSequential()
		.interpolator(interpolateYlGnBu)

	const colorScale = sequentialColorScale;

	/**
	 * Settings
	 */
	/** @type {Object[]} */
	export let data = [];
	/** @type {any} */
	export let defaultKeys;
	/** @type {any} */
	export let numFields;
	/** @type {any} */
	export let tooltipKeys = undefined;
	/** @type {any} */
	export let lockExtentColor;
	/** @type {any} */
	export let lockExtentX;
	/** @type {any} */
	export let lockExtentY;
	/** @type {any} */
	export let lockExtentR;
	/** @type {any} */
	export let logScaleX;
	/** @type {any} */
	export let logScaleY;
	/** @type {any} */
	export let constantR;
	/** @type {any} */
	export let mapboxToken;
	/** @type {any} */
	export let colorByCatScheme;
	/** @type {any} */
	export let colorByScheme;
	/** @type {any} */
	export let rRange;

	/** @type {String} */
	let colorBy;
	/** @type {String} */
	let xKey;
	/** @type {String} */
	let yKey;
	/** @type {String} */
	let rKey;

	function update_keys(keys) {
		colorBy = keys.colorBy
		xKey = keys.xKey
		yKey = keys.yKey
		rKey = keys.rKey
	}

	$: update_keys(defaultKeys);

	const r = 2.5;

	/* --------------------------------------------
	 * Cast num fields as numbers
	 */
	$: {
		data.forEach(d => {
			numFields.forEach(k => {
				d[k] = d[k] === null ? d[k] : +d[k];
			});
		});

		/* --------------------------------------------
		 * Calculate quantiles for our number fields
		 */
		const fieldVectors = data.reduce((memo, d) => {
			numFields.forEach(f => {
				if (!memo[f]) memo[f] = [];
				memo[f].push(d[f]);
			});
			return memo;
		}, {});

		data.forEach(d => {
			numFields.forEach(f => {
				d[`${f}_qtl`] = quantileRank(fieldVectors[f], d[f]);
			});
		});
	}

	let filters = {};

	function update_filters(list) {
		filters = Object.fromEntries(list.map(d => [d, [0, 1]]));
	}

	$: update_filters(numFields);

	/* --------------------------------------------
	 * Calculate extents for scales and displaying to user
	 */
	$: dataExtent = extent(data, d => d[colorBy]);
	$: dataExtentXKey = extent(data, d => d[xKey]);
	$: dataExtentYKey = extent(data, d => d[yKey]);
	$: dataExtentRKey = extent(data, d => d[rKey]);

	$: filteredFeatures = data.filter(d => {
		return d[colorBy] !== null
			&& Object.entries(filters).every(([key, value]) => {
				return d[`${key}_qtl`] !== ''
				&& d[`${key}_qtl`] >= value[0]
				&& d[`${key}_qtl`] <= value[1];
			});
	});

	$: allExtents = Object.fromEntries(numFields.map(field => {
		const ext = extent(filteredFeatures, d => d[field]);
		return [field, ext];
	}));
</script>


<div class="scatter-analyzer-wrapper">

	<div class="sidebar-a">
		<div class="control-group" which="range-filters">
			<div class="group-label">Filter by:</div>
			{#each Object.keys(filters) as key}
				<div class="control field" data-which="{key}">
					<div class="slider">
						<DoubleRangeSlider
							bind:start={filters[key][0]}
							bind:end={filters[key][1]}
							labelExtent={allExtents[key].map(formatNumber2)}
						/>
					</div>
				</div>
			{/each}
		</div>

		<div class="control-group" data-which="key-selectors">
			<div class="control select" data-which="Color by">
				<select bind:value={colorBy}>
					{#each numFields as field, i}
						<option value="{field}">{formatField(field)}</option>
						<option value="{`${field}_qtl`}">{formatField(`${field}_qtl`)}</option>
					{/each}
				</select>
			</div>

			<!-- Axis dropdowns -->
			<div class="control select" data-which="X-Axis">
				<select bind:value={xKey}>
					{#each numFields as field}
						<option value="{field}">{formatField(field)}</option>
						<option value="{`${field}_qtl`}">{formatField(`${field}_qtl`)}</option>
					{/each}
				</select>
				<span>min: {formatNumber(dataExtentXKey[0])}, max: {formatNumber(dataExtentXKey[1])}</span>
				<label for="lock-extent-x"><input id="lock-extent-x" type="checkbox" bind:checked={lockExtentX}/> Lock extent</label>
				<label for="log-scale-x"><input id="log-scale-x" type="checkbox" bind:checked={logScaleX}/> Log scale</label>
			</div>
			<div class="control select" data-which="Y-Axis">
				<select bind:value={yKey}>
					{#each numFields as field}
						<option value="{field}">{formatField(field)}</option>
						<option value="{`${field}_qtl`}">{formatField(`${field}_qtl`)}</option>
					{/each}
				</select>
				<span>min: {formatNumber(dataExtentYKey[0])}, max: {formatNumber(dataExtentYKey[1])}</span>
				<label for="lock-extent-y"><input id="lock-extent-y" type="checkbox" bind:checked={lockExtentY}/> Lock extent</label>
				<label for="log-scale-y"><input id="log-scale-y" type="checkbox" bind:checked={logScaleY}/> Log scale</label>
			</div>
			<div class="control select" data-which="Radius">
				<select bind:value={rKey}>
					{#each numFields as field}
						<option value="{field}">{formatField(field)}</option>
						<option value="{`${field}_qtl`}">{formatField(`${field}_qtl`)}</option>
					{/each}
				</select>
				<span>min: {formatNumber(dataExtentRKey[0])}, max: {formatNumber(dataExtentRKey[1])}</span>
				<label for="lock-extent-r"><input id="lock-extent-r" type="checkbox" bind:checked={lockExtentR}/> Lock extent</label>
				<label for="constant-r"><input id="constant-r" type="checkbox" bind:checked={constantR}/> Fixed radius</label>
			</div>
		</div>
	</div>

	<div class="mainbar">
		<!-- Scatter Chart -->
		<div class="chart-container" data-which="chart">
			<LayerCake
			padding={{ top: 10, right: 5, bottom: 20, left: 55 }}
				x='{xKey}'
				y='{yKey}'
				r='{rKey}'
				z='{colorBy}'
				xScale={logScaleX ? scaleLog() : scaleLinear()}
				yScale={logScaleY ? scaleLog() : scaleLinear()}
				zScale={colorScale}
				zRange={[colorByScheme[0], colorByScheme[colorByScheme.length - 1]]}
				xPadding={logScaleX ? [0, 40] : [25, 25]}
				yPadding={logScaleY ? [0, 40] : [25, 25]}
				rRange={constantR ? [r, r] : rRange}
				data={filteredFeatures}
				extents={{
					x: lockExtentX ? dataExtentXKey : undefined,
					y: lockExtentY ? dataExtentYKey : undefined,
					r: lockExtentR ? dataExtentRKey : undefined
				}}
			>
				<Svg>
					<AxisX
						ticks={logScaleX ? 5 : 10}
					/>
					<AxisY
						ticks={logScaleY ? 5 : 4}
					/>
				</Svg>

				<Canvas>
					<ScatterCanvas
						{r}
						strokeStyle='rgba(0, 0, 0, 0.5)'
					/>
				</Canvas>
				<Html>
					<!-- <InfoBox/> -->
					<QuadTree
						let:x
						let:y
						let:visible
						let:found
						let:radius
					>
						<div
							class="circle"
							style="
								top:{y}px;
								left:{x}px;
								display: { visible ? 'block' : 'none' };
								width:{radius * 2}px;
								height:{radius * 2}px;
							"
						></div>
						<div
							class="tooltip"
							style="
								display: { visible ? 'block' : 'none' };
								top:{y}px;
								left:{x}px;
							"
						>
							{#each Object.keys(found).filter(d => found[d] !== null) as key}
								{#if (Array.isArray(tooltipKeys) && tooltipKeys.includes(key)) || !Array.isArray(tooltipKeys)}
									<div class="tooltip-row"><span class="key">{key}:</span> <span class="value">{formatNumber2(found[key])}</span></div>
								{/if}
							{/each}
						</div>
					</QuadTree>
				</Html>
			</LayerCake>
		</div>

		<!-- Maps -->
		<div class="chart-container" data-which="map">
			<MapboxMap
				colorKey={colorBy}
				rKey={rKey}
				colorExtent={dataExtent}
				rExtent={dataExtentRKey}
				features={filteredFeatures}
				{tooltipKeys}
				{constantR}
				{rRange}
				{colorByScheme}
				accessToken={mapboxToken}
			/>
		</div>
	</div>
</div>

<style>
	.scatter-analyzer-wrapper {
		background: #f5f8fa;
		padding: 14px;
		width: 100%;
		font-family: Helvetica, sans-serif;
		display: flex;
		flex-direction: row;
	}
	.sidebar-a {
		flex: 1
	}
	.mainbar {
		flex: 7;
		position: sticky;
		display: flex;
		flex-direction: column;
	}

	.group-label {
		font-weight: bold;
	}

  .chart-container {
    width: auto;
		position: relative;
  }
	.chart-container[data-which="chart"] {
		height: 250px;
	}

	.chart-container[data-which="map"] {
		margin-top: 14px;
		height: 350px;
		overflow: visible;
	}

	.tooltip {
		position: absolute;
		display: none;
		border: 1px solid #ccc;
		padding: 7px;
		overflow-y: scroll;
		transform: translate(-50%, -111%);
		background: rgba(255, 255, 255, 0.85);
		font-size: 10px;
		min-width: 250px;
		z-index: 999999;
	}

	.tooltip .value {
		float: right;
	}

	.tooltip .key {
		color: #aaa;
	}

	.tooltip.tooltipVisible {
		display: block;
	}

	.control {
		margin-bottom: 14px;
		white-space: nowrap;
	}

	.control:before {
		content: attr(data-which);
		display: block;
	}

	.control[data-which="Color by"] {
		margin-top: 21px;
	}
	.control.checkbox label {
		position: relative;
		left: 40px;
	}
	.control.checkbox:before,
	.control.select:before {
		font-weight: bold;
		width: 60px;
	}


	.control.select label {
		margin-left: 7px;
		user-select: none;
		float: right;
		/* margin-right: 108px; */
		margin-top: 4px;
	}
	.slider {
		width: 208px;
	}

	.control.select {
		margin-bottom: 21px;
	}

	.control select,
	.slider {
		display: inline-block;
		vertical-align: middle;
	}

	.control:not(.select) span {
		margin-left: 14px;
		float: right;
	}

	.circle {
		position: absolute;
		border-radius: 50%;
		background-color: transparent;
		transform: translate(-50%, -50%);
		pointer-events: none;
		border: 1px solid #333;
	}
	/* .cell {
		padding: 0 7px;
		display: inline;
		white-space: nowrap;
	}
	:global(svelte-virtual-list-row) {
		overflow-x: scroll;
	} */
</style>
