<script context="module" lang="ts">
	import Map from './_components/Map.svelte';
	import Marker from './_components/Marker.svelte';

	export async function preload() {
		const res = await this.fetch('/api/wetlands/sightings');
		const markerData = await res.json();
		markerData.forEach((marker) => {
			marker.label = ""
			if (marker.image) {
				marker.label += "<img src='" + marker.image + "' width='150'>"
			}
			let date = new Date(marker.timestamp)
			const da = new Intl.DateTimeFormat('en', {day: 'numeric'}).format(date);
			const mo = new Intl.DateTimeFormat('en', {month: 'short'}).format(date);
			marker.label += "<div class='font-bold'>" + da + " " + mo + " Sightings</div>"
			if (Array.isArray(marker.sightings)) {
				marker.sightings.forEach((sighting) => {
					marker.label += "<div>" + sighting + "</div>"
				})
			} else {
				marker.label += "<div>" + marker.sightings + "</div>"
			}
		})
		return {markerData};
	}
</script>

<svelte:head>
	<title>Wetlands</title>
	<link rel="stylesheet" href="/leaflet.css"/>
</svelte:head>

<div class="w-full h-screen flex flex-col">
	<Map>
		{#each markerData as marker}
			<Marker lat="{marker.lat}" lon="{marker.lon}" label="{marker.label}" image="{marker.image}"/>
		{/each}
	</Map>

	<a href="/wetlands/sighting"
	   class="btn-wetlands">Submit
		Sighting</a>
</div>
<script lang="ts">
	export let markerData
</script>
