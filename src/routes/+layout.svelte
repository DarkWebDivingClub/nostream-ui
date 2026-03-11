<script lang="ts">
	import '@src/style/app.css';
	import '@src/style/tailwind.css';
	import {onMount} from 'svelte';
	import {PrimaryNav, Communities} from '$components';
	import {Log} from '@src/services/Logger';
	import {me} from '@src/stores/profile.svelte';
	import {normalizeRelayUrl} from '@red-token/welshman/util';
	import {NostrClient} from 'iz-nostrlib';
	import {applicationRelay, devMode, baseUrls, packageMode, package_Mode} from '$config';

	const layout = Log.child({component: '+layout.svelte'});
	let login: boolean | undefined = $state();

	let {children} = $props();
	let isExpanded: boolean | undefined = $state(false);

	const nostrClient = new NostrClient();
	console.log('BaseURL: ', baseUrls, 'PackageMode: ', packageMode);
	$effect(() => {
		document.documentElement.style.setProperty('--sidebar-width', isExpanded ? '80px' : '0px');
	});
	// let profileSession: SynchronisedSession

	$effect(() => {
		isExpanded ??= me.pubkey !== '' ? true : false;
		console.log('test');
	});

	$effect(() => {
		localStorage.setItem('sidebar-state', `${isExpanded}`);
	});
	onMount(() => {
		const savedState = localStorage.getItem('sidebar-state');
		isExpanded = savedState ? JSON.parse(savedState) : undefined;
		// setContext({
		// 	net: getDefaultNetContext(),
		// 	app: getDefaultAppContext()
		// });
		// // load the master relays
		// globalState.relays = [];
		// const url = 'wss://relay.stream.labs.h3.se';

		const relays = [normalizeRelayUrl(applicationRelay)];

		// const globalCommunity = new GlobalNostrContext(relays);
		//
		// globalCommunity.profileService.nip01Map.addListener((keys: string[]) => {
		// 	for(let key of keys) {
		// 		console.log('GESUND');
		// 		const profile = getOrCreateProfile(key);
		// 		profile.nip01Event = globalCommunity.profileService.nip01Map.value.get(key)
		// 	}
		// });
		//
		// globalCommunity.profileService.nip65Map.addListener((keys: string[]) => {
		// 	for(let key of keys) {
		// 		console.log('GESUND2');
		// 		const profile = getOrCreateProfile(key);
		// 		profile.nip65Event = globalCommunity.profileService.nip65Map.value.get(key)
		// 	}
		// });
		// const globalCommunity = new CommunityNostrContext('globalNostrCommunity', relays, '');
		// globalCommunity.notifications.on(NotificationEventType.PROFILE, (event) => {
		// 	if (event instanceof Nip01UserMetaDataEvent) {
		// 		if (event.event === undefined) throw new Error('event event is null');
		//
		// 		layout.info('profile', event.event.pubkey, event.profile);
		// 		profiles.set(event.event.pubkey, event.profile);
		//
		// 		return;
		// 	}
		//
		// 	throw new Error('Unknown event');
		// });
		// communities.forEach((community: CommunityNostrContext) => {
		// 	community.connect();
		//
		// 	// 		const url = 'wss://relay.stream.labs.h3.se';
		// 	// 		const relays = [normalizeRelayUrl(url)];
		//
		// 	community.notifications.on(NotificationEventType.TORRENT, (event) => {
		// 		layout.info('update torrent event', event);
		// 	});
		//
		// 	community.notifications.on(NotificationEventType.PROFILE, (event) => {
		// 		if (event instanceof Nip01UserMetaDataEvent) {
		// 			if (event.event === undefined) throw new Error('event event is null');
		//
		// 			layout.info('profile', event.event.pubkey, event.profile);
		// 			profiles.set(event.event.pubkey, event.profile);
		// 			return;
		// 		}
		//
		// 		throw new Error('Unknown event');
		// 	});
		// });
		//
		//
		// const url = 'wss://relay.stream.labs.h3.se';
		// const relays = [normalizeRelayUrl(url)];
		//
		// if (me.profilesSession === undefined) {
		//     NostrClient.getInstance()
		//         .createSession(relays)
		//         .then((session) => {
		//             me.profilesSession = session;
		//
		//             const sub = me.profilesSession.createSubscription([{kinds: [Nip01UserMetaDataEvent.KIND]}]);
		//
		//             me.profilesSession.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
		//                 if (event.kind === Nip01UserMetaDataEvent.KIND) {
		//                     const re = new Nip01UserMetaDataEventBuilder(event).build();
		//
		//                     console.log('Update profile');
		//
		//                     if (re.event === undefined) throw Error(`Unknown event: ${event}`);
		//
		//                     profiles.set(re.event.pubkey, re.profile);
		//                 } else {
		//                     console.log('Unknown event ', event);
		//                 }
		//             });
		//         });
		// }
	});
</script>

{#if package_Mode}{/if}
<main>
	{#if me.pubkey !== ''}
		<div class="left-sidebar {isExpanded ? 'expanded' : ''}">
			<Communities {isExpanded} />
			<button class="sidebar-toggle" onclick={() => (isExpanded = !isExpanded)}>
				{#if isExpanded}
					<svg width="24" height="24" viewBox="0 0 24 24">
						<path d="M15 18l-6-6 6-6" stroke="currentColor" fill="none" />
					</svg>
				{:else}
					<svg width="24" height="24" viewBox="0 0 24 24">
						<path d="M9 18l6-6-6-6" stroke="currentColor" fill="none" />
					</svg>
				{/if}
			</button>
		</div>
	{/if}
	<div class="content-area">
		<PrimaryNav />
		<div class="main-content">
			{@render children()}
		</div>
	</div>
</main>

<style>
	main {
		min-height: 100vh;
	}

	.content-area {
		flex: 1;
		margin-left: calc(-1 * var(--sidebar-width));
		transition: margin-left 0.3s ease;
	}

	.sidebar-toggle {
		position: fixed;
		right: -40px;
		top: 20px;
		width: 32px;
		height: 32px;
		z-index: 2001;
		background: var(--bg-1);
		border: 2px solid var(--border-color);
		border-radius: 8px;
		pointer-events: auto;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(80, 80, 80, 0.1);
		transform: translateX(50%);
	}

	.sidebar-toggle:hover {
		background: var(--bg-2);
	}

	.left-sidebar {
		position: fixed;
		pointer-events: auto;

		top: 0;
		left: 0;
		height: 100%;
		width: var(--sidebar-width);
		transform: translateX(calc(-1 * var(--sidebar-width)));
		transition: transform 0.3s ease;
	}

	.left-sidebar.expanded {
		width: 80px;
		transform: translateX(0);
	}

	.left-sidebar.expanded ~ .content-area {
		margin-left: var(--sidebar-width);
	}

	@media (max-width: 768px) {
		main {
			margin-left: 0 !important;
		}

		.sidebar-toggle {
			right: -36px;
			bottom: 16px;
			width: 28px;
			height: 28px;
		}
	}
</style>
