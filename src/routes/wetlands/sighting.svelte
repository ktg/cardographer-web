<script context="module" lang="ts">
	import type {Preload} from "@sapper/common";

	export const preload: Preload = async function () {
		const res = await this.fetch('/api/wetlands/creatures');
		const data = await res.json();

		if (res.status === 200) {
			return {critters: data};
		} else {
			this.error(res.status, data.message);
		}
	}
</script>

<svelte:head>
	<title>Wetlands</title>
</svelte:head>

<div class="flex justify-end">
	{#if !$session.volunteer}
		<a class="px-2" href="/wetlands/login">Volunteer Login</a>
	{:else}
		<a class="px-2" on:click={handleLogout}>Log out {$session.name}</a>
	{/if}
</div>

<form class="flex flex-col" action="/api/wetlands/sightings" method="post" enctype="multipart/form-data">
	<div>
		<label for="locationInput"><span>Location</span>
			<input id="locationInput" name="location" placeholder="Location" readonly value="{location || ''}"/>
		</label>


		{#if (scannerStatus === 0)}
			<span class="w-4">&nbsp;</span>
			<LoadingIndicator color="#393"/>
		{:else if (scannerStatus === 1)}
			<button class="btn-wetlands" on:click|preventDefault={start}>Scan Sighting Post</button>
		{/if}
		<GeoLocation bind:lat={lat} bind:lon={lon}/>

		<input type="hidden" name="lat" value="{lat}">
		<input type="hidden" name="lon" value="{lon}">

	</div>
	<div class="w-full">
		<ArtcodeScanner bind:status={scannerStatus} bind:this={scanner} on:markerChanged={markerChanged}/>
		{#if (scannerStatus === 2)}
			<div>Center the sighting pole with the camera view</div>
			<button class="btn-wetlands" on:click|preventDefault={stop}>Stop Scan</button>
		{/if}
	</div>

	<div class="flex flex-wrap">
		{#each critters as critter}
			{#if $session.volunteer}
				<div class="flex flex-col p-2">
					<img alt="{critter.name}" width="250" src="{critter.image}"/>
					<label class="p-2">
						<input type="checkbox" name="sightings" value="{critter.name} Female" on:change={checkChange}>
						<span class="px-2">{critter.name} Female</span>
					</label>
					<label class="p-2">
						<input type="checkbox" name="sightings" value="{critter.name} Male" on:change={checkChange}>
						<span class="px-2">{critter.name} Male</span>
					</label>
				</div>
			{:else}
				<label class="flex flex-col p-2">
					<img alt="{critter.name}" width="250" src="{critter.image}"/>
					<span class="p-2 flex items-center">
						<input type="checkbox" name="sightings" value="{critter.name}" on:change={checkChange}>
						<span class="px-2">{critter.name}</span>
					</span>
				</label>
			{/if}
		{/each}
	</div>

	<label>
		<span>Notes</span>
		<textarea placeholder="Notes" class="w-full"></textarea>
	</label>

	<label>
		<span>Upload Image</span>
		<input type="file" name="image" accept="image/*"/>
	</label>

	<button class="btn-wetlands" disabled="{lat == null || !submittable}">Submit</button>

</form>

<style>
    form {
        @apply px-8 py-4
    }

    textarea {
        @apply border rounded py-2 px-4 focus:outline-none focus:border-green-800
    }

    input {
        @apply border rounded py-2 px-4 focus:outline-none focus:border-green-800
    }
</style>

<script lang="ts">
	import GeoLocation from "./_components/GeoLocation.svelte";
	import ArtcodeScanner from "./_components/ArtcodeScanner.svelte";
	import LoadingIndicator from "../../components/LoadingIndicator.svelte";
	import {stores} from '@sapper/app'

	const {session} = stores();

	let scanner: ArtcodeScanner
	let scannerStatus = 0
	let location: string = null
	let gpsAvailable = false
	let lat: number = null
	let lon: number = null
	let submittable = false
	export let critters = []

	function start() {
		scanner.start()
	}

	function stop() {
		scanner.stop()
	}

	function checkChange() {
		const checkboxes = document.querySelectorAll('input[type="checkbox"]')
		for (let i = 0; i < checkboxes.length; i++) {
			if (checkboxes[i].checked) {
				submittable = true
				return
			}
		}
		submittable = false
	}

	function markerChanged(event) {
		if (event.detail != null) {
			console.log(event.detail)
			scanner.stop()
			location = "Sighting Pole 1"
			lat = 52.902530
			lon = -1.226245
		}
	}

	async function handleLogout() {
		const response = await fetch('/api/wetlands/logout', {method: "POST"});
		if (response.ok) {
			$session.volunteer = false
			delete $session.name
		} else {
			console.log(response.statusText)
			//error = `Sorry, there was a problem (${response.status})`;
			return;
		}
	}
</script>
