<script context="module" lang="ts">
	export async function preload() {
		const res = await this.fetch('/api/drink/plot');
		const plot = await res.json();
		return {plot: plot};
	}
</script>

<svelte:head>
	<title>Drinking Accelerometer Plot</title>
	<script src="/plotly-latest.min.js" type="text/javascript"></script>
</svelte:head>

<div id='plotDiv' class="w-full" style="height: 800px"></div>

<script>
	export let plot;

	if (typeof window !== 'undefined') {
		let plotDiv = document.getElementById('plotDiv');
		Plotly.newPlot(plotDiv, plot, {}, {responsive: true});
	}
</script>
