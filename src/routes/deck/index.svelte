<script context="module">
	export async function preload({ params, query }) {
		const res = await this.fetch(`/api/deck/list`);
		const data = await res.json();

		if (res.status === 200) {
			return { decks: data };
		} else {
			this.error(res.status, data.message);
		}
	}
</script>

<script>
	export let decks;
</script>

