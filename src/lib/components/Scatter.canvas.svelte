<script>
  import { getContext } from 'svelte';
  import { scaleCanvas } from 'layercake';
	import { interpolateYlGnBu } from 'd3-scale-chromatic';

  // import settings from '../settings/settings.js';

  const { data, xGet, yGet, rGet, width, height, zGet, zScale, z, zDomain, zRange } = getContext('LayerCake');
  const { ctx } = getContext('canvas');

  // export let fill = '#fff';
  /** @type {Number} */
  export let stroke = 1;
  /** @type {String} */
	export let strokeStyle = '#000';

	function o (str) {
		return str.replace('rgb', 'rgba').replace(')', ', 0.75)');
	}

  $: {
    if ($ctx) {
      /* --------------------------------------------
       * If you were to have multiple canvas layers
       * maybe for some artistic layering purposes
       * put these reset functions in the first layer, not each one
       * since they should only run once per update
       */
      scaleCanvas($ctx, $width, $height);
      $ctx.clearRect(0, 0, $width, $height);

      /* --------------------------------------------
       * Draw our scatterplot
       */
      $data.filter(d => typeof $z(d) !== 'undefined').forEach(d => {
        // console.log('d', d)
        // console.log('z', $z(d))
        // console.log('range', $zScale.range())
        // console.log('transform', $zScale($z(d)))
        // console.log('get', $zGet(d))

        if ($zScale.domain().length === 2) {
          $zScale.interpolator(interpolateYlGnBu);
        }

        $ctx.beginPath();
        $ctx.arc($xGet(d), $yGet(d), $rGet(d), 0, 2 * Math.PI, false);
        $ctx.fillStyle = o($zGet(d));
        $ctx.fill();
        $ctx.lineWidth = stroke;
        $ctx.strokeStyle = strokeStyle;
        $ctx.stroke();
      });
    }
  }
</script>
