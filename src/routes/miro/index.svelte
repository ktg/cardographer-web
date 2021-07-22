<script context="module" lang="ts">
	export const ssr = false
</script>

<LibLoader url="https://miro.com/app/static/sdk.1.1.js" on:loaded={loaded}/>

<script lang="ts">
	const icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>'

	import LibLoader from "$lib/LibLoader.svelte";

	async function loaded() {
		miro.onReady(() => {
			miro.initialize({
				extensionPoints: {
					bottomBar: {
						title: 'Cardographer Upload',
						svgIcon: icon,
						onClick: async () => {
							await miro.board.ui.openLeftSidebar('/miro/sidebar.html')
						},
					},
				},
			})
		})
	}
</script>