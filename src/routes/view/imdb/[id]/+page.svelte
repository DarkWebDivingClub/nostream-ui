<script lang="ts">
	import {page} from '$app/state';
	import {onMount} from 'svelte';
	import {s} from '@src/stores/assetStore.svelte';
	import {defaultNip65} from '@src/stores/profile.svelte';
	import {EventType} from '@nostream/sdk';
	import {VideoPlayer} from '$components';
	import {ReactiveArray} from '@nostream/sdk/util';
	import {Nip35TorrentEvent, UserType} from '@nostream/sdk/nips';
	import {DynamicSubscription, DynamicSynchronisedSession} from '@nostream/sdk/ses';
	import {globalRunes} from '@src/stores/profile.svelte';
	import {goto} from '$app/navigation';

	enum RelayType {
		READ = 'read',
		WRITE = 'write'
	}

	class Relay {
		// TODO: make  this more clever
		static getType(type: string | undefined): Set<RelayType> {
			switch (type) {
				case RelayType.READ:
					return new Set<RelayType>([RelayType.READ]);
				case RelayType.WRITE:
					return new Set<RelayType>([RelayType.WRITE]);
			}

			return new Set<RelayType>([RelayType.READ, RelayType.WRITE]);
		}

		public address: string;
		public type: Set<RelayType>;
		public options: string[];

		constructor(params: string[]) {
			this.address = params[0];
			this.type = Relay.getType(params[1]);
			this.options = params.splice(2);
		}
	}

	let zc = $derived(globalRunes.nip01Events.values().toArray());

	console.log(zc.length);

	zc.forEach((c) => {
		const cap = c.capabilities;
		console.log(cap);
	});

	let searchRelays: Relay[] = $derived.by(() => {
		const sss = zc
			// .filter(
			// e => e.type === UserType.COMMUNITY)
			.filter((e) => e.type === UserType.COMMUNITY && e.capabilities.find((e) => e[0] === 'nip35'))
			.map((c) =>
				(globalRunes.nip65Events.get(c.pubkey) ?? defaultNip65).relays
					.map((relay) => new Relay(relay))
					.filter((relay) => relay.type.has(RelayType.READ))
			)
			.flat()
			.reduce((map, val) => map.set(val.address, val), new Map<string, Relay>())
			.values()
			.toArray();
		return sss;
	});

	onMount(async () => {
		// //TODO MAKE THIS A GLOBAL SEARCH PARAM
		console.log(searchRelays);

		const ra = new ReactiveArray(searchRelays.map((r) => r.address));
		const dss = new DynamicSynchronisedSession(ra);

		s.assets = [];

		dss.eventStream.emitter.on(EventType.DISCOVERED, (event) => {
			console.log('discovered', event);
			const te = Nip35TorrentEvent.buildFromEvent(event);
			s.assets.push(te);

			if (s.playing === undefined) {
				s.playing = te;
				// download(s.playing);
			}
		});

		const id = page.params.id;
		const ds = new DynamicSubscription(dss, [{kinds: [Nip35TorrentEvent.KIND], '#i': [`imdb:${id}`]}]);

		// communities.forEach((communitie) => {
		// const session: SynchronisedSession = new SynchronisedSession(communitie.relays);
		//
		// communitie.relays.forEach((relay) => {
		// 	const sub = new Subscription(session, [{kinds: [Nip35TorrentEvent.KIND], '#i': [page.params.id]}], [relay]);
		// });
		//
		// session.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
		// 	const out = new Nip35TorrentEventBuilder(event).build();
		// 	out.event = event;
		// 	s.assets.push(out);
		//
		// 	console.log(s.assets.length);
		//
		// 	if (s.playing === undefined) {
		// 		s.playing = out;
		// 		download(s.playing);
		// 	}
		// });
		// });
	});

	function upload() {
		sessionStorage.setItem('createTemplate', JSON.stringify({title: '', imdbId: page.params.id}));
		console.log(page.params.id);
		goto('/create/asset');
	}
</script>

<div class="video-page">

	Hello!

	<!--	<div class="torrent-title">{page.params.id}</div>-->
	{#if s.playing !== undefined}
		<VideoPlayer infoHash={s.playing.x} />
		<!--			<TorrentLike></TorrentLike>-->
	{/if}

	<button onclick={upload}>Upload</button>
</div>

<style>
	.video-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		min-height: 100vh;
		background-color: var(--bg-1);
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
	}

	#video-player {
		width: 100%;
		height: auto;
		border-radius: 8px;
		outline: none;
	}

	.torrent-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--fg-1);
		margin-top: 1.5rem;
		text-align: center;
	}

	@media (max-width: 768px) {
		.video-container {
			padding: 1rem;
		}

		.torrent-title {
			font-size: 1.3rem;
		}
	}

	@media (max-width: 480px) {
		.video-container {
			padding: 0.5rem;
		}

		.torrent-title {
			font-size: 1.1rem;
		}
	}
</style>
