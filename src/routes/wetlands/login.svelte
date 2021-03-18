<script lang="ts">
	import {goto, stores} from '@sapper/app';

	const {session} = stores();

	export let error: string
	let name = ""
	let password = ""

	const handleLogin = async () => {
		const response = await fetch('/api/wetlands/login', {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				name: name,
				password: password
			}),
		});
		if (response.status !== 200) {
			error = `Sorry, there was a problem (${response.status})`;
			return;
		}
		$session.volunteer = true
		$session.name = name
		goto('/wetlands/sighting');
	};

</script>

<style>
    input {
        @apply border rounded py-2 px-4 focus:outline-none focus:border-green-800
    }
</style>

<div class="px-8 py-4">
	<h1>Volunteer Login</h1>

	{#if error}
		<div>ERROR: {error}</div>
	{:else}
		<form on:submit|preventDefault="{handleLogin}" method="post">
			<div class="flex flex-col">
				<label class="block">
					<span>Name</span>
					<input autofocus class="mt-1 block w-full" type="text" bind:value="{name}"/>
				</label>
				<label class="block">
					<span>Password</span>
					<input class="mt-1 block w-full" type="password" bind:value="{password}"/>
				</label>

				<button class="btn-wetlands" type="submit" disabled={!name || !password}>Login</button>
			</div>
		</form>
	{/if}
</div>
