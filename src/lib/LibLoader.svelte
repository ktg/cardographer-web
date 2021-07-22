<script>
	import {createEventDispatcher, onMount} from 'svelte';

	const dispatch = createEventDispatcher();
	export let url;
	let script;

	onMount(async () => {
		console.log("lib1")
		script.addEventListener('load', () => {
			console.log("lib2")

			dispatch('loaded');
		})

		script.addEventListener('error', (event) => {
			console.error("something went wrong", event);
			dispatch('error');
		});
	});

	function loaded() {
		console.log("lib3")

		dispatch('loaded');
	}
</script>

<div>
	<script bind:this={script} src={url} on:load={loaded}/>
</div>
