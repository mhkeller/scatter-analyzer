<script>
  import { getContext } from 'svelte';
	import * as geo from 'd3-geo';
	import { scaleSequential, scaleDiverging, scaleOrdinal } from 'd3-scale';
	import { interpolateBlues, interpolatePuOr, schemeTableau10 } from 'd3-scale-chromatic';
  import { createEventDispatcher } from 'svelte';

  export let ordinalDomain = [];

	const dispatch = createEventDispatcher();
	const { data, width, height } = getContext('LayerCake');

	export let colorBy = undefined;

  /* --------------------------------------------
   * Add this in case you want to plot only a subset of the features
   * while keeping the zoom on the whole geojson feature set
   */
  export let features = $data.features;
  export let extent = [0, 1];

  $: projection = geo.geoAlbersUsa()
    .fitSize([$width, $height], $data);

  $: geoPath = geo.geoPath(projection);

  $: fill = colorBy.includes('increase') && colorBy.includes('qtl') ?
    scaleDiverging(interpolatePuOr).domain([0, 0.5, 1]) :
    colorBy.includes('state') ?
    scaleOrdinal(schemeTableau10).domain(ordinalDomain) :
    colorBy.includes('increase') ?
    scaleDiverging(interpolatePuOr).domain([extent[0], 1, extent[1]]) :
    scaleSequential(interpolateBlues).domain(extent);

 function h(json, evt) {
    dispatch('hover', {json, evt})
  }

</script>

<g class="map-group" on:mouseleave={() => dispatch('leave')}>
  {#each features as feature}
    <path
      class="feature-path"
      fill="{fill(feature.properties[colorBy])}"
      d="{geoPath(feature)}"
      on:mouseover={(evt) => h(feature.properties, evt)}
    ></path>
  {/each}
</g>

<style>
  .feature-path {
    stroke: #333;
    stroke-width: 0.5px;
  }
  .feature-path:hover {
    stroke-width: 1.5px;
    stroke: #000;
  }
</style>
