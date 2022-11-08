<script>
  import { getContext } from 'svelte';
	import { commas } from 'yootils';
	const { data } = getContext('LayerCake');

	$: states = [...new Set($data.map(d => d.properties.state))];

	$: counties = $data.map(d => [d.properties.county, d.properties.state, d.properties.all_cases, d.properties.unemp_rate_march_20])

	// $: console.log('states', states);
	// $: console.log('data', counties);
</script>

<div class="info-box">
	<div class="row"><span>Counties: </span>{commas($data.length)}</div>
	<div class="row"><span>States: </span>{states.length}</div>
</div>

<style>
	.info-box {
		position: absolute;
		top: 0;
		right: 0;
		font-size: 13px;
		font-family: 'nyt-franklin', sans-serif;
		transform: translate(0, -100%);
	}
	.row span {
		font-weight: bold;
	}
</style>
