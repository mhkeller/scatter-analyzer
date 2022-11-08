<script>
	export let tooltipFeatures = [];
	// console.log('tooltip features', tooltipFeatures);
	const bannedKeys = [];
	function clean (str) {
		return str.includes ? str.includes('.00') ? str.split('.')[0] : str : str;
	}
</script>

<div class="tooltip-body">
	{#each tooltipFeatures as feature}
		<div class="feature-group">
			{#each Object.keys(feature.properties) as key}
				{#if !bannedKeys.includes(key)}
					<div class="row">
						<span class="key">{key}:</span> <span class="value">{clean(feature.properties[key])}</span>
					</div>
				{/if}
			{/each}
		</div>
	{/each}
	{#if tooltipFeatures.length > 1}
		<div class="total">{tooltipFeatures.length} total</div>
	{/if}
</div>

<style>
	.tooltip-body {
		background-color: #273d56;
		color: #fff;
		padding: 7px;
		transform: translateY(-50%);
		z-index: 999;
		font-size: 12px;
	}
	.feature-group {
		text-rendering: optimizeLegibility;
	}
	.feature-group:not(:first-child) {
		border-top: 1px solid #ffffff70;
		padding-top: 5px;
		margin-top: 5px;
	}
	.key {
		opacity: 0.7;
	}
	.total {
		position: absolute;
		bottom: 5px;
		right: 5px;
		opacity: 0.5;
	}
</style>
