<script lang="ts">
	import {wt} from '@src/stores/wtZool.svelte';
	import {onMount} from 'svelte';

	let {infoHash} = $props();

	onMount(() => {
		console.log("XOOOOL" + infoHash)
		download(infoHash);
	});

	function download(infohash: string) {
		let options = {
			announce: ['wss://tracker.webtorrent.dev'],
			maxWebConns: 500
		};

		const torrent = wt.add(infohash, options);

		torrent.on('ready', () => {
			// Torrents can contain many files. Let's use the .mp4 file
			const file = torrent.files.find((file: any) => file.name.endsWith('.mp4'));

			if (file === undefined) throw new Error('ALIENS');

			const player = document.querySelector('video');

			if (player === null) throw new Error('ALIENS2');

			// player.src = file.streamURL

			// file.renderTo(player)
			file.streamTo(player);

			console.log('Ready to play!');
		});

		torrent.on('warning', (err: any) => {
			console.log(err);
		});
		torrent.on('error', (err: any) => {
			console.log(err);
		});
		torrent.on('wire', (wire: any) => {
			console.log(wire);
			console.log('number of peers' + torrent.numPeers);
		});
		torrent.on('download', (bytes: any) => {
			console.log(bytes);
			console.log('received: ' + torrent.received);
			console.log('downloaded: ' + torrent.downloaded);
		});
		torrent.on('upload', (bytes: any) => {
			console.log(bytes);
			console.log('uploaded: ' + torrent.uploaded);
		});
	}
</script>

<!-- poster={thumbnail} -->
<div class="video-container">
	<video id="video-container" controls class="custom-video-player">
		<track kind="captions" src="" label="Subtitles" default />
	</video>
</div>

<style>
	.video-container {
		max-width: 1200px;
		margin: 2rem auto;
		border-radius: var(--border-radius);
		overflow: hidden;
		background: var(--bg-2);
		box-shadow: 0 4px 12px var(--shadow-color);
		position: relative;
	}

	.custom-video-player {
		width: 100%;
		height: auto;
		aspect-ratio: 16/9;
		display: block;
		background: black;
	}

	.custom-video-player::-webkit-media-controls-panel {
		background: var(--overlay-background) !important;
		backdrop-filter: blur(8px);
	}

	.custom-video-player::-webkit-media-controls-play-button,
	.custom-video-player::-webkit-media-controls-mute-button {
		filter: invert(0.8);
		transition: transform 0.2s ease;
	}

	.custom-video-player::-webkit-media-controls-timeline {
		background: var(--bg-3);
		border-radius: 2px;
	}

	.custom-video-player::-webkit-media-slider-thumb {
		background: var(--accent-color) !important;
		border-radius: 2px;
	}

	.custom-video-player::-webkit-media-controls-current-time-display,
	.custom-video-player::-webkit-media-controls-time-remaining-display {
		color: var(--text-primary);
		font-family: inherit;
	}

	.custom-video-player::cue {
		background: transparent;
		color: var(--text-primary);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
		font-family: inherit;
		font-size: 1.1rem;
	}

	@media (max-width: 768px) {
		.video-container {
			margin: 1rem;
			border-radius: calc(var(--border-radius) * 0.75);
		}

		.custom-video-player::-webkit-media-controls-panel {
			padding: 0.5rem;
		}
	}

	@media (max-width: 480px) {
		.custom-video-player::cue {
			font-size: 0.9rem;
		}
	}
</style>
