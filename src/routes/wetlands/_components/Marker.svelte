<script lang="ts">
	import {getContext, onMount} from 'svelte';
	import {key} from "./_mapKey";

	const {getMap} = getContext(key);

	export let lat: number
	export let lon: number
	export let label: string
	export let image: string

	onMount(async () => {
		const {Icon, Marker} = await import('leaflet')
		const map = getMap();

		const birdIcon = new Icon({
			iconUrl: 'images/bird_marker.svg',
			shadowUrl: 'images/marker-shadow.png',
			iconSize: [48, 48],
			shadowSize: [41, 41],
			shadowAnchor: [13, 44],
			iconAnchor: [24, 48],
			popupAnchor: [0, -48],
			attribution: '<a href="https://thenounproject.com/amoghdesign/collection/map-markers/?i=192050">Map Marker</a> by P Thanga Vignesh, <a href="https://thenounproject.com/georgiana.ionescu/collection/birds/?i=1610510">Quail</a> by Georgiana Ionescu'
		})
		const marker = new Marker([lat, lon], {icon: birdIcon})
		marker.bindPopup(label)
		map.addLayer(marker)

		return () => {
			map.removeLayer(marker);
		}
	})
</script>