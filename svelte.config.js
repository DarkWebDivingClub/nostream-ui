import adapter from '@sveltejs/adapter-static';
import {vitePreprocess} from '@sveltejs/vite-plugin-svelte';
import multiAdapter from '@macfja/svelte-multi-adapter';
import staticAdapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess({script: true}),

	kit: {
		csp: {
			directives: {
				// 'worker-src': ['self'],
				// 'script-src': ['self']
				'script-src': ["'self'", "'unsafe-inline'", "blob:"],
				'worker-src': ["'self'", "blob:"]
			}
		},
		paths: {
			relative: false
		},
		adapter: multiAdapter([
			staticAdapter({pages: 'build/static', fallback: 'index.html'}),
			adapter({
				fallback: 'index.html',
				pages: '.vite/main_window',
				assets: '.vite/main_window'
			}),
		]),
		// adapter: adapter({
		// 	fallback: 'index.html',
		// 	pages: '.vite/main_window',
		// 	assets: '.vite/main_window'
		// }),
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
