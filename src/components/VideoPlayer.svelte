<script lang="ts">
	import {onMount, onDestroy} from 'svelte';
	import videojs from 'video.js';
	import {wt} from '@src/stores/wtZool.svelte';
	import type {Torrent, TorrentFile} from 'webtorrent';

	type PlayerOptions = typeof videojs.options;

	const {infoHash} = $props();
	let videoElement: HTMLVideoElement | null = null;

	console.log(infoHash);

	let player: any = null;

	let torrentInfo = $state({
		infoHash: '',
		done: false,
		progress: 0,
		upload: 0,
		download: 0
	});

	console.log(infoHash);

	const options = {
		announce: ['wss://tracker.webtorrent.dev'],
		maxWebConns: 500
	};

	console.log(infoHash);

	function update(torrent: Torrent) {
		torrentInfo.done = torrent.done;
		torrentInfo.progress = torrent.progress;
		torrentInfo.download = torrent.downloaded;
		torrentInfo.upload = torrent.uploaded;
	}

	console.log(infoHash);

	function loadTorrent(torrent: Torrent) {
		console.log('loadTorrent', torrent);

		torrentInfo.infoHash = torrent.infoHash;

		update(torrent);

		torrent.on('done', () => {
			update(torrent);
		});

		torrent.on('download', () => {
			update(torrent);
		});

		torrent.on('upload', () => {
			update(torrent);
		});

		torrent.files.forEach((file: any) => {
			console.log(file.name);
			console.log(file.streamURL);
		});

		let playFile = torrent.files.find((file: TorrentFile) => {
			return file.name.endsWith('.mpd');
		});

		console.log(playFile?.streamURL);

		// const xn = playFile?.streamURL;

		// Add support of MP4
		if (!playFile) {
			playFile = torrent.files.find((file: TorrentFile) => {
				return file.name.endsWith('.mp4');
			});
		}

		if (playFile === undefined || playFile === null) {
			throw new Error(`Torrent player not found.`);
		}

		if (videoElement) {
			player.src([
				{
					// src: xn,
					src: playFile.streamURL,
					// type: playFile.type
					// type: 'application/dash+xml'
				}
			]);
			player.load();
			player.play();
		}
	}

	console.log(infoHash);

	onMount(() => {
		if (videoElement) {
			const videoOptions: PlayerOptions = {
				controls: true,
				responsive: true,
				fluid: true
				// poster: 'https://t4.ftcdn.net/jpg/01/22/97/01/360_F_122970161_S5JEt3v3wTdR7QXavi9seSKpuVBsUQsn.jpg'
				// preload: 'auto',
				// sources: []
			};

			player = videojs(videoElement, videoOptions);
		}

		// TODO rewrite this with await
		console.log(infoHash);

		new Promise<Torrent>((resolve, reject) => {
			wt.get(infoHash).then((torrent: Torrent) => {
				console.log(infoHash);

				if (torrent == null) torrent = wt.add(infoHash, options);

				update(torrent);

				if (torrent.ready) resolve(torrent);

				torrent.on('ready', () => {
					update(torrent);
					resolve(torrent);
				});

				torrent.on('error', reject);
			});
		}).then((torrent) => {
			loadTorrent(torrent);
		});

		// torrent.on('warning', (err) => {
		// 	console.log(err);
		// });
		// torrent.on('error', (err) => {
		// 	console.log(err);
		// });
		// torrent.on('wire', (wire) => {
		// 	console.log(wire);
		// 	console.log('number of peers' + torrent.numPeers);
		// });
		// torrent.on('download', (bytes) => {
		// 	console.log(bytes);
		// 	console.log('received: ' + torrent.received);
		// 	console.log('downloaded: ' + torrent.downloaded);
		// });
		// torrent.on('uploadold', (bytes) => {
		// 	console.log(bytes);
		// 	console.log('uploaded: ' + torrent.uploaded);
		// });
	});

	onDestroy(() => {
		if (player) {
			player.dispose();
		}
	});
</script>

<div class="video-page">
	<div class="video-container">
		<video controls class="video-js vjs-big-play-centered" bind:this={videoElement}>
			<track kind="captions" />
		</video>
	</div>
	<div class="video-container">
		{torrentInfo.infoHash}
		{torrentInfo.done}
		{torrentInfo.progress * 100}% {torrentInfo.upload}
		{torrentInfo.download}
	</div>
</div>

<style>
	.video-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		min-height: 100vh;
		min-width: 100vw;
		background-color: var(--bg-1);
		gap: 1rem;
	}

	.video-container {
		width: 100%;
		max-width: 1200px;
		background: var(--bg-2);
		border: 1px solid var(--border-color);
		border-radius: 16px;
		box-shadow: 0 4px 12px var(--shadow-color);
		padding: 1.5rem;
		position: relative;
		display: flex;
		justify-content: center;
		height: auto;
		margin: 0 auto;
	}

	.video-js {
		width: 100%;
	}
</style>
