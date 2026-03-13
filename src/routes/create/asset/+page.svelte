<script lang="ts">
	import {onDestroy, onMount} from 'svelte';
	import {goto} from '$app/navigation';
	import {EventType, type Publisher, safeFindSingleTagValue} from 'iz-nostrlib';
	import {Nip35TorrentEvent} from 'iz-nostrlib/nips';
	import {CommunityNostrContext} from 'iz-nostrlib/communities';
	import {
		Nip9999SeederTorrentTransformationRequestEvent,
		Nip9999SeederTorrentTransformationResponseEventHandler,
		NostrCommunityServiceClient
	} from 'iz-nostrlib/seederbot';
	import {DynamicPublisher, DynamicSynchronisedSession, StaticEventsProcessor} from 'iz-nostrlib/ses';
	import type {TrustedEvent} from '@red-token/welshman/util';
	import {wt} from '@src/stores/wtZool.svelte';
	import {globalNostrContext, globalRunes, me} from '@src/stores/profile.svelte';
	import {torrentAnnounceList} from '@src/config/config';

	// type RequestState = {
	// 	state: string,
	// 	seq: number,
	// 	total: number,
	// 	progress: number,
	// 	message: string,
	// 	final: boolean,
	// }

	const template = JSON.parse(sessionStorage.getItem('createTemplate') || '{}');

	const states = $state({
		community: '',
		bot: '',
		botPubkey: '4793a715a1f58a2729dcefd18234d6f970231b938634328317a05ce3a0b8ea85',
		// botPubkey: 'b1e997f11f8d454eae2b2c1d52948e800df4e7103412d78984827eea2be138b2',
		formats: undefined,
		title: template.title,
		imdbId: template.imdbId,
		infoHash: '',
		file: null,
		resp: {states: {state: null, seq: 0, total: 100, message: 'Not started the request', progress: 0, final: false}}
	});

	let progress = $derived(
		states.resp.states.final
			? 100
			: (100 * Math.max(states.resp.states.seq - 1, 0) + states.resp.states.progress) / states.resp.states.total
	);

	let selectedOption: string | undefined = $state('');

	let isOpen: boolean = $state(false);
	let selectElement: HTMLElement | null = null;

	let selectedOption2: string | undefined = $state('');
	let isOpen2: boolean = $state(false);
	let selectElement2: HTMLElement | null = null;


	function handleClickOutside(event: MouseEvent): void {
		if (selectElement && !selectElement.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
		} else {
			document.removeEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		document.removeEventListener('click', handleClickOutside);
	});

	// const community = $derived(globalRunes.communities.get(states.community ?? ''));

	// let title = 'Big Buck Bunny DASH';
	// let imdbId = 'tt1254207';
	// let infoHash = '5bcb88dd5f1f2ec8940964987b6b0c2357f6a9f9';

	const publishers: Publisher[] = [];

	onMount(async () => {
		// // We do this as a mashinegun we need a way to select what communities we should publish, and as who
		// globalRunes.communities.forEach((community, key) => {
		// 	const cnc = new CommunityNostrContext(key, globalNostrContext);
		// 	const session = new DynamicSynchronisedSession(cnc.relays);
		//
		// 	console.log('KABOOOM!!!!! ERRROOORORORORORORO !TODO!');
		// 	// // community.identities.forEach((ci) => {
		// 	// // 	publishers.push(new Publisher(session, ci));
		// 	// });
		// });
	});

	const options = {
		announce: torrentAnnounceList,
		maxWebConns: 500
	};

	async function onCreate() {
		// Send the message
		const mediaTags: string[] = [];

		if (states.imdbId !== '') {
			mediaTags.push(`imdb:${states.imdbId}`);
		}

		const te: Nip35TorrentEvent = new Nip35TorrentEvent(
			states.title,
			states.infoHash,
			'Description',
			[],
			[],
			mediaTags,
			[]
		);

		console.log(states.community);

		if (states.community === undefined || me.identity === undefined)
			throw new Error('Community not found or identiy invalid');

		//TODO: this is a hack we just force the main identity on things here and create on demand
		const cnc = new CommunityNostrContext(states.community, globalNostrContext);
		const session = new DynamicSynchronisedSession(cnc.relays);
		const dp = new DynamicPublisher(session, me.identity);
		dp.publish(te);

		//
		//
		// publishers.forEach((publisher) => {
		// 	const x = publisher.publish(Nip35TorrentEvent.KIND, te.opts);
		// });

		const v: string = `/view/infoHash/${states.infoHash}`;
		await goto(v)

		// goto(v).then((r) => {
		// 	console.log(r);
		// });
	}

	async function onTranscode() {
		console.log(states.file);
		console.log('transcode!');

		if (states.community === undefined || me.identity === undefined) throw new Error('Community not found!');

		const cnc = new CommunityNostrContext(states.community, globalNostrContext);
		const ncs = new NostrCommunityServiceClient(cnc, me.identity);
		// const dss = new DynamicSynchronisedSession(ncs.community.relays);
		// const dp = new DynamicPublisher(dss, ncs.identity);

		// TODO We need to make this safe
		const torrent = wt.seed(states.file, options);

		torrent.on('infoHash', () => {
			console.log('infoHash:' + torrent.infoHash);
			console.log('magnetURI:' + torrent.magnetURI);

			// TODO: This has to be made dynamic and you should select a bot
			// const botNSec: string = 'nsec1p5p9ax0uftre04ewgxntkca4jurj2zlhjed46nwr22xs652vgtss84jeep';
			// const decoded = nip19.decode(botNSec);
			// if (decoded.type !== 'nsec') throw Error('ssfsdfsfsdfsdfsddffsdfsdfsdsfdsfdfsdsfdsfd');
			// const botSeckey = decoded.data;

			// DO NOT USE CHECK THE BOTKEY
			// const botPubkey = getPublicKey(botSeckey);

			// TODO: VERY UGLY COPY PASTE THAT SHOULD BE MOVED SOMEWHERE ELSE! WE NEDD A BOT API MODULE
			type Format = {
				width: number;
				height: number;
				video_bitrate?: string;
			};

			type Formats = {
				[key: string]: Format;
			};

			const formats: Formats = {
				sd: {
					width: 720,
					height: 480
					// video_bitrate: '1500k'
				},
				hd: {
					width: 1280,
					height: 720
					// video_bitrate: '2500k'
				},
				fhd: {
					width: 1920,
					height: 1080
					// video_bitrate: '5000k'
				}
				// uhd: {
				// 	width: 3840,
				// 	height: 2160
				// 	// video_bitrate: '8000k'
				// }
			};

			type Language = {
				short: string;
				name: string;
			};

			type Languages = {
				[key: string]: Language;
			};

			const languages: Languages = {
				en: {short: 'en', name: 'English'}
			};

			const reqt = {
				file: torrent.files[0].path,
				subtitles: [{lang: languages.en}],
				formats: formats,
				imdbId: states.imdbId
			};

			const req = new Nip9999SeederTorrentTransformationRequestEvent(
				states.botPubkey,
				states.title,
				torrent.infoHash,
				reqt
			);

			const {dss, pub} = ncs.request(req);

			dss.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
				console.log(event);

				const sep = new StaticEventsProcessor([
					new Nip9999SeederTorrentTransformationResponseEventHandler((resp) => {
						states.resp.states = resp.state;

						if (resp.state.final) {
							console.log('final');

							states.infoHash = safeFindSingleTagValue(event, 'x');
							wt.remove(torrent.infoHash);
						}
					})
				]);

				sep.processEvent(event);
			});
		});

		// torrent.on('upload', (bytes: any) => {
		// 	// console.log(bytes);
		// });

		torrent.on('error', (err: any) => {
			console.log(err);
		});

		torrent.on('wire', (wire: any) => {
			console.log("Wire" + wire);
		});

		torrent.on('noPeers', (announceType: any) =>  {
			console.log(announceType);
		})
	}

	async function handleChange(event: any) {
		states.file = event.target.files[0];
	}
</script>

<div class="create-container">
	<div class="form-card">
		<form class="input-group">
			<div class="form-field">
				<label for="community">Community</label>
				<div class="custom-select" bind:this={selectElement}>
					<div class="select-trigger" role="dialog" onclick={() => (isOpen = !isOpen)}>
						{selectedOption || 'Select community'}
					</div>
					{#if isOpen}
						<ul class="select-options">
							{#each me.communities as option}
								<li
									onclick={() => {
										selectedOption = globalRunes.profiles.get(option.pubkey)?.nip01Event.profile.name ?? option.pubkey;
										states.community = option.pubkey;
										isOpen = false;
									}}
								>
									{option.nickname ?? globalRunes.profiles.get(option.pubkey)?.nip01Event.profile.name ?? option.pubkey}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>

			<div class="form-field">
				<label for="bot">Bot</label>
				<div class="custom-select" bind:this={selectElement2}>
					<div class="select-trigger" role="dialog" onclick={() => (isOpen2 = !isOpen2)}>
						{selectedOption2 || 'Select bot'}
					</div>
					{#if isOpen2}
						<ul class="select-options">
							{#each globalRunes.services as option}
								<li
									onclick={() => {
										selectedOption2 = globalRunes.profiles.get(option.pubkey)?.nip01Event.profile.name ?? option.pubkey;
										states.bot = option.pubkey;
										isOpen2 = false;
									}}
								>
									{option.nickname ?? globalRunes.profiles.get(option.pubkey)?.nip01Event.profile.name ?? option.pubkey}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>


			<div class="form-field">
				<label for="title">Movie title</label>
				<input id="title" type="text" bind:value={states.title} placeholder="Movie title" class="form-input" />
			</div>

			<div class="form-field">
				<label for="imdbId">IMDB ID</label>
				<input id="imdbId" type="text" bind:value={states.imdbId} placeholder="IMDB ID" class="form-input" />
			</div>

			<div class="form-field">
				<label for="file" class="upload-label">Upload video</label>
				<input id="file" type="file" accept="video/*" onchange={handleChange} class="file-input" />
			</div>

			{#if states.resp.states.state === null}
				{#if states.file !== null && states.community !== undefined}
					<button type="button" class="submit-btn" onclick={() => onTranscode()}>
						Submit to Seeder for transcoding
						<svg class="submit-icon" viewBox="0 0 24 24">
							<path d="M3 20v-6l8-2-8-2V4l19 8-19 8Z" />
						</svg>
					</button>
				{/if}
			{:else}
				<div class="progressbar-container">
					<div class="progressbar-bar" style="width: {progress}%;"></div>
					<div class="progressbar-text">{states.resp.states.state}</div>
				</div>
			{/if}

			<div class="form-field">
				<label for="infoHash">Info Hash</label>
				<input id="infoHash" type="text" bind:value={states.infoHash} placeholder="Info Hash" class="form-input" />
			</div>

			<button type="submit" disabled={states.infoHash === ''} class="submit-btn" onclick={() => onCreate().then()}>
				Create
				<svg class="submit-icon" viewBox="0 0 24 24">
					<path d="M3 20v-6l8-2-8-2V4l19 8-19 8Z" />
				</svg>
			</button>
		</form>
	</div>
</div>

<!-- <select bind:value={state.botPubkey}>
	{#each me.transcodingBots as option}
		<option value={option.pubkey}
		>{option.nickname ??
		globalRunes.profiles.get(option.pubkey)?.nip01Event.profile.name ??
		option.pubkey}</option>
	{/each}
</select> -->
<style>
	/* test */
	.custom-select {
		position: relative;
		width: 100%;
	}

	.select-trigger {
		padding: 10px;
		background: var(--bg-2);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		color: var(--fg-1);
		cursor: pointer;
	}

	.select-options {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: var(--bg-2);
		border: 2px solid var(--border-color);
		border-radius: 8px;
		max-height: 200px;
		overflow-y: auto;
		z-index: 10;
		backdrop-filter: blur(10px);
	}

	.select-options li {
		padding: 10px;
		color: var(--fg-1);
		cursor: pointer;
	}

	.select-options li:hover {
		background: var(--accent-color);
	}

	/* end test */

	.create-container {
		max-width: 600px;
		margin: 2rem auto;
		padding: 0 1rem;
		box-sizing: border-box;
	}

	.form-card {
		background: var(--bg-1);
		border-radius: 16px;
		border: 1px solid var(--border-color);
		padding: 2rem;
		box-shadow: 0 4px 12px var(--shadow-color);
		overflow: hidden;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-size: 0.9rem;
		color: var(--fg-1);
	}

	.form-input {
		width: 100%;
		padding: 1rem;
		font-size: 1rem;
		background: var(--bg-2);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		color: var(--text-fg-1);
		transition: all 0.3s ease;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--accent-color);
		transform: translateY(-1px);
		box-shadow:
			0 0 0 3px var(--accent-transparent),
			0 2px 8px var(--color-hover);
	}

	.form-input::placeholder {
		color: var(--fg-2);
	}

	.upload-label {
		display: block;
		padding: 0.75rem;
		background: var(--bg-3);
		color: var(--fg-1);
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.2s ease;
		text-align: center;
	}

	.upload-label:hover {
		background: var(--border-color);
	}

	.file-input {
		display: none;
	}

	.progressbar-container {
		width: 100%;
		height: 30px;
		position: relative;
		background: var(--bg-2);
		border: 2px solid var(--border-color);
		border-radius: 8px;
		overflow: hidden;
	}

	.progressbar-bar {
		height: 100%;
		background: var(--accent-color);
		/* animation: width 0.4s; */
		transition: width 0.4s ease-in-out;
	}

	.progressbar-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #fff;
		font-size: 14px;
		pointer-events: none;
	}

	.submit-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 1rem;
		border: 2px solid var(--border-color);
		background: transparent;
		color: white;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			transform 0.2s ease,
			background 0.3s ease;
	}

	.submit-btn:hover {
		transform: translateY(-1px);
		background: var(--accent-color);
	}

	.submit-btn:disabled {
		color: #999;
		cursor: not-allowed;
	}

	.submit-btn:disabled:hover {
		background-color: var(--bg-2);
	}

	.submit-icon {
		width: 24px;
		height: 24px;
		fill: currentColor;
	}

	@media (max-width: 768px) {
		.create-container {
			padding: 0 0.5rem;
		}

		.form-card {
			padding: 1.5rem;
			border-radius: 12px;
		}

		.form-input,
		.submit-btn {
			padding: 0.875rem;
			font-size: 0.95rem;
		}
	}

	@media (max-width: 480px) {
		.form-card {
			padding: 1rem;
		}

		.input-group {
			gap: 1rem;
		}
	}
</style>
