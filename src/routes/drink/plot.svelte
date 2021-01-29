<script context="module">
	export async function preload(page, session) {
		const res = await this.fetch('/api/drink/plot');
		const plot = await res.json();
		console.log("Plot loaded:" + plot);
		return {plot};
	}
</script>

<svelte:head>
	<title>Drinking Accelerometer Plot</title>
	<script src="https://cdn.plot.ly/plotly-latest.min.js" type="text/javascript"></script>
</svelte:head>

<div id='plotDiv'></div>

<style>
	#plotDiv {
		width: 100%;
		height: 800px;
	}
</style>

<script>
	// TODO import {onMount} from 'svelte';

	export let plot;

	if (typeof window !== 'undefined') {
		window.addEventListener('load', () => {
			console.log('page is fully loaded');
			let plotDiv = document.getElementById('plotDiv');
			Plotly.newPlot(plotDiv, plot, {}, {responsive: true});
		});
	}
</script>
