<script>
  import { getContext } from 'svelte';
  import { quadtree } from 'd3-quadtree';

  const { data, xGet, yGet, rGet, width, height } = getContext('LayerCake');

  let visible = false;
  let found = {};
  let e = {};

  export let dataset = undefined;
  export let x = 'x';
  export let y = 'y';

  $: xGetter = x === 'x' ? $xGet : $yGet;
  $: yGetter = y === 'y' ? $yGet : $xGet;

  function findItem (evt) {
    e = evt;
    found = finder.find(evt[`layer${x.toUpperCase()}`], evt[`layer${y.toUpperCase()}`], 300) || {};
		visible = Object.keys(found).length > 0;
  }

  $: finder = quadtree()
    .extent([[-1, -1], [$width + 1, $height + 1]])
    .x(xGetter)
    .y(yGetter)
    .addAll(dataset || $data);

</script>

<style>
  .bg {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
</style>

<div
  class="bg"
  on:mousemove="{findItem}"
  on:mouseout="{() => visible = false}"
></div>
<slot
  x={xGetter(found) || 0}
  y={yGetter(found) || 0}
  radius={$rGet(found)}
  {found}
  {visible}
  {e}
></slot>
