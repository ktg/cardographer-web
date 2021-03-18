<script lang="ts">
	import {setContext} from 'svelte';
	import {key} from "./_mapKey";

	setContext(key, {
		getMap: () => map
	});

	export let lat;
	export let lon;
	export let zoom;

	let map;

	export async function mapSetup(elem: HTMLElement) {
		const {Map, TileLayer, ImageOverlay} = await import('leaflet');

		map = new Map(elem, {})
			.setView([52.902, -1.23], 14)
			.addLayer(new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				opacity: 0.5
			}))
			.addLayer(new ImageOverlay('images/attenborough.png', [[52.8885, -1.2538], [52.9168, -1.2095]], {}))
	}
</script>

<div class="w-full flex-1" use:mapSetup>
	{#if map}
		<slot></slot>
	{/if}
</div>