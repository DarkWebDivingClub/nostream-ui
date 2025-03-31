import adapter from '@sveltejs/adapter-static';
import {vitePreprocess} from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess({script: true}),

	kit: {
		// csp: {
		// 	directives: {
		// 		'worker-src': ['self'],
		// 		'script-src': ['self']
		// 	}
		// },
		paths: {
			relative: false
		},
		adapter: adapter({
			fallback: 'index.html',
			pages: '.vite/main_window',
			assets: '.vite/main_window'
		}),
		// files: {
		// 	assets: 'static',
		// 	lib: 'src/lib',
		// 	params: 'src/params',
		// 	routes: 'src/routes',
		// 	// serviceWorker: 'src/static/sw.min.js',
		// 	appTemplate: 'src/app.html',
		// 	errorTemplate: 'src/error.html'
		// },
		alias: {
			$config: 'src/config/config.js',
			'@src': 'src',
			$components: 'src/components',
			'@test': 'test'
		}
	}
};

export default config;
