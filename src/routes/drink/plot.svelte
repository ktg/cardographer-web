<svelte:head>
	<title>Drinking Accelerometer Plot</title>
	<script src="/plotly-latest.min.js" type="text/javascript"></script>
</svelte:head>

<div class="w-full h-screen flex flex-col">
	<div id='plotDiv' class="w-full" style="height: 800px" bind:this={plot}></div>
</div>
<script>
	import {onMount} from "svelte";

	let plot;

	onMount(async () => {
		const res = await fetch('/api/drink/plot')
		const data = await res.json()
		Plotly.newPlot(plot, data, {}, {responsive: true});
	})
</script>
