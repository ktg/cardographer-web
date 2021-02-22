<script context="module" lang="ts">
</script>

<svelte:head>
	<title>Wetlands</title>
	<link rel="stylesheet" href="/leaflet.css"/>
</svelte:head>

<div class="w-full" style="height: 800px" ></div>

<script lang="ts">
	//export let plot;

	export async function mapSetup(elem: HTMLElement) {
		const {createScanner, ScannerUI} = await import('artcodes-js');
		const ui = new ScannerUI();

	}
</script>
