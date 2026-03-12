import {defineConfig} from 'vite';
import {sveltekit} from '@sveltejs/kit/vite';
// import tailwindcss from '@tailwindcss/vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';

//https://vitejs.dev/config
export default defineConfig({
	server: {
		host: true,
		allowedHosts: ['iz-stream-ui', 'nostream-ui', 'localhost', '127.0.0.1'],
		fs: {
			allow: ['./src']
		}
	},
	plugins: [
		// tailwindcss(),
		sveltekit(),
		viteStaticCopy({
			targets: [
				{
					// src: 'node_modules/webtorrent/dist/sw.min.js', // Path to the service worker in node_modules
					src: 'static/sw.min.js', // Path to the service worker in node_modules
					dest: '' // Copies to the root of the `static` directory
				}
			]
		})
	],
	clearScreen: false
	// build: {
	// 	minify: true,
	// },
});
