<button class="btn-wetlands" class:hidden={enabled} on:click|preventDefault={startGPS}>GPS Location</button>

<script lang="ts">
	import {createEventDispatcher, onMount} from "svelte";

	const dispatch = createEventDispatcher();
	let enabled = false

	export let lat
	export let lon

	function startGPS() {
		navigator.geolocation.watchPosition(gpsUpdated)
	}

	function gpsUpdated(position: GeolocationPosition) {
		if (position != null) {
			lat = position.coords.latitude
			lon = position.coords.longitude
		}
	}

	onMount(async () => {
		enabled = !navigator.geolocation
	});
</script>