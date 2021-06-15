import sveltePreprocess from 'svelte-preprocess'
import nodeAdapter from '@sveltejs/adapter-node'

// svelte dev seems to struggle with base being set 1.0.0
const mode = process.env.NODE_ENV;
const production = mode === 'production';

const PRODUCTION_BASE = '/wetlands';

/** @type {import('@sveltejs/kit').Config} */
export default {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		sveltePreprocess({
			defaults: {
				style: "postcss",
			},
			postcss: true
		}),
	],

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		paths: {
			base: (production ? PRODUCTION_BASE : ''),
			//assets: ''
		},
		adapter: nodeAdapter({})
	}
};
