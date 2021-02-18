<script context="module" lang="ts">
	export async function preload({ params, query }) {
		const id = params.id;
		const res = await this.fetch(`/api/deck/${id}`);
		const data = await res.json();

		if (res.status === 200) {
			return { deck: data };
		} else {
			this.error(res.status, data.message);
		}
	}
</script>

<script>
	export let deck;
</script>

<style>
</style>

<svelte:head>
	<title>{deck.name}</title>
</svelte:head>

<h1>{deck.name}</h1>

<div class='content'>
	{@html deck.html}
</div>
