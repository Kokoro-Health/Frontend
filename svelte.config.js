import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null,
			precompress: false,
			strict: false
		}),
		alias: {
			$components: 'src/lib/components',
			$util: 'src/lib/util',
			$api: 'src/lib/api',
			$assets: 'src/lib/assets',
			$security: 'src/lib/security'
		},
		env: {
			publicPrefix: 'PUBLIC_',
			dir: './'
		}
	}
};

export default config;
