<script context="module" lang="ts">
</script>

<svelte:head>
	<title>Wetlands</title>
	<link rel="stylesheet" href="/leaflet.css"/>
</svelte:head>

<div class="w-full" style="height: 800px" use:mapSetup></div>

<script lang="ts">
	//export let plot;

	export async function mapSetup(elem: HTMLElement) {
		const {Map, TileLayer} = await import('leaflet');
		new Map(elem, {})
			.setView([51.505, -0.09], 13)
			.addLayer(new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			}));
	}
</script>
