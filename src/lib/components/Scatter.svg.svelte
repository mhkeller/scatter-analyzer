<script>
  import { getContext } from 'svelte';
  import { scaleCanvas } from 'layercake';
	import { scaleSequential, scaleDiverging, scaleOrdinal } from 'd3-scale';
	import { interpolatePuOr, schemeTableau10 } from 'd3-scale-chromatic';

  import settings from '../settings/settings.js';

  const { data, xGet, yGet, rGet, zScale } = getContext('LayerCake');

  // export let fill = '#fff';
  export let strokeWidth = 1;
	export let stroke = 'rgba(0, 0, 0, 0.5)';
	export let colorBy = undefined;

	function o (str) {
		return str.replace('rgb', 'rgba').replace(')', ', 0.75)');
	}
</script>

<g class="scatter-group">
	{#each $data.filter(d => typeof d[colorBy] !== 'undefined') as d}
		<circle
			cx={$xGet(d)}
			cy={$yGet(d)}
			r={$rGet(d)}
			fill={o($zScale(d[colorBy]))}
			{stroke}
			stroke-width={strokeWidth}
		/>
	{/each}
</g>
