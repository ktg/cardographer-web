<canvas bind:this={canvas} class:hidden="{status !== 2}"></canvas>
<video bind:this={video} class="hidden"></video>

<script lang="ts">
	import type {Scanner} from 'artcodes-js';
	import {createEventDispatcher, onMount} from "svelte";

	const dispatch = createEventDispatcher();
	let canvas: HTMLCanvasElement
	let video: HTMLVideoElement
	export let status = 0
	export let experience = {
		name: "Test",
		actions: [
			{
				codes: ["1:1:2:3:5"],
				name: "Test Marker",
				url: "https://cardographer.cs.nott.ac.uk"
			}
		]
	}
	let scanner: Scanner

	export function start() {
		scanner.start()
	}

	export function stop() {
		scanner.stop()
	}

	onMount(async () => {
		const {createScanner} = await import('artcodes-js');
		const options = {
			canvas: canvas,
			video: video,
			markerChanged: (newMarker) => {
				if(newMarker != null) {
					const code = newMarker.regions.join(':')
					dispatch('markerChanged', code)
				} else {
					dispatch('markerChanged', null)
				}
			},
			stateChanged: (state) => {
				status = state
			}
		}
		scanner = await createScanner(experience, options)
	});
</script>
