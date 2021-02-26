<script>
	import {Marker} from 'leaflet';

	// ...get the context here

	export let lat;
	export let lon;
	export let label;

	const marker = new Marker([lon, lat], {})
		.addTo(map);
</script>