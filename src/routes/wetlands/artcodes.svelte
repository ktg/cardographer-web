<script context="module" lang="ts">
</script>

<svelte:head>
	<title>Wetlands</title>
</svelte:head>

<div class="w-full" style="height: 800px">
	<canvas bind:this={canvas} class:hidden="{status !== 2}"></canvas>
	<video bind:this={video} class="hidden"></video>
	{#if (status === 1)}
		<button id="startButton" on:click={start}>Start</button>
	{/if}
	{#if (status === 2)}
		<button id="stopButton" on:click={stop}>Stop</button>
	{/if}
</div>

<style>
    .hidden {
        display: none;
    }
</style>

<script lang="ts">
	import {onMount} from "svelte";
	import type {Scanner} from 'artcodes-js';

	let canvas: HTMLCanvasElement;
	let video: HTMLVideoElement;
	let status = 0
	let scanner: Scanner

	function start() {
		scanner.start()
	}

	function stop() {
		scanner.stop()
	}

	onMount(async () => {
		const {createScanner} = await import('artcodes-js');
		const experience = {
			name: "Test",
			actions: [
				{
					codes: ["1:1:2:3:5"],
					name: "Test Marker",
					url: "https://cardographer.cs.nott.ac.uk"
				}
			]
		}

		const options = {
			canvas: canvas,
			video: video,
			markerChanged: (marker) => {
				console.log(marker);
			},
			stateChanged: (state) => {
				status = state
			}
		}
		scanner = await createScanner(experience, options)
	});
</script>
