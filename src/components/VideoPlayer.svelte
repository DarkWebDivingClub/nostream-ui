<script lang="ts">
	import {onMount, onDestroy} from 'svelte';
	import videojs from 'video.js';
	import 'videojs-contrib-dash';
	import {wt} from '@src/stores/wtZool.svelte';
	import {torrentAnnounce} from '$config';
	import type {Torrent, TorrentFile} from 'webtorrent';
	type PlayerOptions = typeof videojs.options;

	const {infoHash, autoplay = false} = $props<{infoHash: string; autoplay?: boolean}>();
	let videoElement: HTMLVideoElement | null = null;
	let playerError = $state('');

	// console.log(infoHash);

	let player: any = null;

	let torrentInfo = $state({
		infoHash: '',
		done: false,
		progress: 0,
		upload: 0,
		download: 0
	});

	const announceRaw = torrentAnnounce || 'wss://tracker.webtorrent.dev,wss://tracker.btorrent.xyz,wss://tracker.openwebtorrent.com';
	const announce = announceRaw
		.split(',')
		.map((value: string) => value.trim())
		.filter((value: string) => value.length > 0);
	const wsAnnounce = announce.filter((value: string) => value.startsWith('ws://') || value.startsWith('wss://'));
	const httpAnnounce = announce.filter((value: string) => value.startsWith('http://') || value.startsWith('https://'));

	const options = {
		announce,
		maxWebConns: 500
	};

	console.log('[nostream] VideoPlayer init', {infoHash});
	console.log('[nostream] announce config resolved', {
		mode: import.meta.env.MODE,
		viteTorrentAnnounceRaw: announceRaw,
		announce,
		wsAnnounce,
		httpAnnounce
	});

	function update(torrent: Torrent) {
		torrentInfo.done = torrent.done;
		torrentInfo.progress = torrent.progress;
		torrentInfo.download = torrent.downloaded;
		torrentInfo.upload = torrent.uploaded;
	}

	console.log('[nostream] VideoPlayer watching hash', {infoHash});

	function loadTorrent(torrent: Torrent) {
		console.log('[nostream] torrent loaded', {
			infoHash: torrent.infoHash,
			name: torrent.name,
			fileCount: torrent.files.length
		});

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

		// torrent.files.forEach((file: any) => {
		// 	console.log(file.name);
		// 	console.log(file.streamURL);
		// });

		let playFile = torrent.files.find((file: TorrentFile) => {
			return file.name.endsWith('.mpd');
		});

		// console.log(playFile?.streamURL);

		// const xn = playFile?.streamURL;

		// Add support of MP4
		if (!playFile) {
			playFile = torrent.files.find((file: TorrentFile) => {
				return file.name.endsWith('.mp4');
			});
		}

		if (playFile === undefined || playFile === null) {
			console.error('[nostream] no playable file found in torrent', {
				infoHash: torrent.infoHash,
				files: torrent.files.map((f) => f.name)
			});
			throw new Error(`Torrent player not found.`);
		}

		console.log('[nostream] selected playable file', {
			name: playFile.name,
			streamURL: playFile.streamURL
		});

		if (videoElement) {
			const isMpd = playFile.name.endsWith('.mpd');
			const isMp4 = playFile.name.endsWith('.mp4');
			const sourceType = isMpd ? 'application/dash+xml' : isMp4 ? 'video/mp4' : undefined;

			player.src([
				{
					src: playFile.streamURL,
					type: sourceType
				}
			]);
			console.log('[nostream] player src set', {src: playFile.streamURL, type: sourceType});
			player.load();
			if (!autoplay) {
				// Force manual-start behavior even if a plugin/source attempts auto playback.
				player.pause();
				player.currentTime(0);
			}

			player.one('error', () => {
				console.error('[nostream] player error', {
					infoHash: torrent.infoHash,
					file: playFile.name,
					src: playFile.streamURL,
					type: sourceType,
					error: player.error?.()
				});
			});

			player.ready(() => {
				const qualityLevels = player.qualityLevels();
				qualityLevels.on('change', function () {
					console.log('Quality changed to:', qualityLevels.selectedIndex);
				});
			});

			if (autoplay) {
				void player.play();
			}
		}
	}

	// console.log(infoHash);

	onMount(() => {
		if (wsAnnounce.length === 0) {
			playerError =
				'Invalid tracker config: browser playback requires at least one ws:// or wss:// tracker in VITE_TORRENT_ANNOUNCE.';
			console.error('[nostream] invalid announce configuration for browser playback', {
				infoHash,
				announce,
				wsAnnounce,
				httpAnnounce
			});
			return;
		}

		if (videoElement) {
			const videoOptions: PlayerOptions = {
				controls: true,
				responsive: true,
				fluid: true,
				autoplay,
				preload: 'metadata',
				// poster: 'https://t4.ftcdn.net/jpg/01/22/97/01/360_F_122970161_S5JEt3v3wTdR7QXavi9seSKpuVBsUQsn.jpg'
				// preload: 'auto',
				// sources: [],
				liveui: true,
			};

			player = videojs(videoElement, videoOptions);
		}

		// TODO rewrite this with await
		console.log('[nostream] torrent lookup start', {infoHash});

		new Promise<Torrent>((resolve, reject) => {
			wt.get(infoHash).then((torrent: Torrent) => {
				console.log('[nostream] wt.get resolved', {infoHash, found: torrent != null});

				if (torrent == null) {
					console.log('[nostream] adding torrent', {infoHash, announce});
					torrent = wt.add(infoHash, options);
				}

				update(torrent);

				if (torrent.ready) resolve(torrent);

				torrent.on('ready', () => {
					console.log('[nostream] torrent ready', {
						infoHash: torrent.infoHash,
						fileCount: torrent.files.length,
						numPeers: torrent.numPeers
					});
					update(torrent);
					resolve(torrent);
				});

				torrent.on('metadata', () => {
					console.log('[nostream] torrent metadata', {
						infoHash: torrent.infoHash,
						fileCount: torrent.files.length,
						files: torrent.files.map((file) => file.name)
					});
				});

				torrent.on('wire', (_wire: unknown, addr: string) => {
					console.log('[nostream] wire connected', {
						infoHash: torrent.infoHash,
						addr,
						numPeers: torrent.numPeers
					});
				});

				torrent.on('noPeers', (announceType: string) => {
					console.warn('[nostream] no peers', {
						infoHash,
						announceType,
						numPeers: torrent.numPeers
					});
				});

				torrent.on('warning', (warning: unknown) => {
					console.warn('[nostream] torrent warning', {infoHash, warning});
				});

				torrent.on('error', (error) => {
					console.error('[nostream] torrent error', {
						infoHash,
						error
					});
					reject(error);
				});
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
		<video data-testid="video-player" controls class="video-js vjs-big-play-centered" bind:this={videoElement}>
			<track kind="captions" />
		</video>
		{#if playerError}
			<p data-testid="video-player-error" style="color: #ef4444;">{playerError}</p>
		{/if}
	</div>
	<div class="video-container" data-testid="torrent-stats">
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
