<script>
	import { clamp } from 'yootils';

	/** @type {Number} */
	export let start = 0;
	/** @type {Number} */
	export let end = 1;

	/** @type {Array} */
	export let labelExtent = []

	/** @type {Element} */
	let leftHandle;

	/** @type {Element} */
	let body;
	/** @type {Element} */
	let slider;

	function draggable(node) {
		let x;
		let y;

		function handleMousedown(event) {
			x = event.clientX;
			y = event.clientY;

			node.dispatchEvent(new CustomEvent('dragstart', {
				detail: { x, y }
			}));

			window.addEventListener('mousemove', handleMousemove);
			window.addEventListener('mouseup', handleMouseup);
		}

		function handleMousemove(event) {
			const dx = event.clientX - x;
			const dy = event.clientY - y;
			x = event.clientX;
			y = event.clientY;

			node.dispatchEvent(new CustomEvent('dragmove', {
				detail: { x, y, dx, dy }
			}));
		}

		function handleMouseup(event) {
			x = event.clientX;
			y = event.clientY;

			node.dispatchEvent(new CustomEvent('dragend', {
				detail: { x, y }
			}));

			window.removeEventListener('mousemove', handleMousemove);
			window.removeEventListener('mouseup', handleMouseup);
		}

		node.addEventListener('mousedown', handleMousedown);

		return {
			destroy() {
				node.removeEventListener('mousedown', handleMousedown);
			}
		};
	}

	function setHandlePosition (which) {
		return function (evt) {
			const { left, right } = slider.getBoundingClientRect();
			const parentWidth = right - left;

			const p = Math.min(Math.max((evt.detail.x - left) / parentWidth, 0), 1);

			if (which === 'start') {
				start = p;
				end = Math.max(end, p);
			} else {
				start = Math.min(p, start);
				end = p;
			}
		}
	}

	function setHandlesFromBody (evt) {
		const { width } = body.getBoundingClientRect();
		const { left, right } = slider.getBoundingClientRect();

		const parentWidth = right - left;

		const leftHandleLeft = leftHandle.getBoundingClientRect().left;

		const pxStart = clamp((leftHandleLeft + evt.detail.dx) - left, 0, parentWidth - width);
		const pxEnd = clamp(pxStart + width, width, parentWidth);

		const pStart = pxStart / parentWidth;
		const pEnd = pxEnd / parentWidth;

		start = pStart;
		end = pEnd;
	}
</script>

<div class="double-range-container">
	<div class="slider" bind:this={slider}>
		<div
			class="body"
			bind:this={body}
			use:draggable
			on:dragmove="{setHandlesFromBody}"
			style="
				left: {100 * start}%;
				right: {100 * (1 - end)}%;
			"
			></div>
		<div
			class="handle"
			bind:this={leftHandle}
			data-which="start"
			data-value="{start.toFixed(2)}"
			data-label="{labelExtent[0]}"
			use:draggable
			on:dragmove="{setHandlePosition('start')}"
			style:left="{100 * start}%"
			class:flip="{start > 0.33}"
		></div>
		<div
			class="handle"
			data-which="end"
			data-value="{end.toFixed(2)}"
			data-label="{labelExtent[1]}"
			use:draggable
			on:dragmove="{setHandlePosition('end')}"
			style:left="{100 * end}%"
			class:flip="{end < 0.66}"
		></div>
	</div>
</div>

<style>
	.double-range-container {
		width: 100%;
		height: 20px;
		user-select: none;
		box-sizing: border-box;
		white-space: nowrap;
		display: inline-block;
		vertical-align: top;
	}
	.slider {
		position: relative;
		width: 100%;
		height: 6px;
		top: 50%;
		transform: translate(0, -50%);
		background-color: #e2e2e2;
		box-shadow: inset 0 7px 10px -5px #4a4a4a, inset 0 -1px 0px 0px #9c9c9c;
		border-radius: 1px;
	}
	.handle {
		position: absolute;
		top: 50%;
		width: 0;
		height: 0;
		cursor: grab;
	}
	.handle:after {
		content: ' ';
		box-sizing: border-box;
		position: absolute;
		border-radius: 50%;
		width: 16px;
		height: 16px;
		background-color: #fdfdfd;
		border: 1px solid #7b7b7b;
		transform: translate(-50%, -50%)
	}
	/* .handle[data-which="end"]:after{
		transform: translate(-100%, -50%);
	} */
	.handle:active:after {
		background-color: #ddd;
		cursor: grabbing;
	}
	.body {
		top: 0;
		position: absolute;
		background-color: #34a1ff;
		bottom: 0;
		cursor: col-resize;
	}
	.handle:before {
		content: attr(data-value) ' (' attr(data-label) ')';
		position: absolute;
		top: 8px;
		font-size: 12px;
	}
	.handle[data-which="start"]:before {
		left: 0;
	}
	.handle[data-which="start"].flip:before {
		transform: translateX(-100%);
	}
	.handle[data-which="end"]:before {
		right: 0;
	}
	.handle[data-which="end"].flip:before {
		transform: translateX(100%);
	}
</style>
