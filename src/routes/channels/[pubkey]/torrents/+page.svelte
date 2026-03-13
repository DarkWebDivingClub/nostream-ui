<script lang="ts">
	import {page} from '$app/state';
	import {onMount} from 'svelte';
	import {EventType} from '@nostream/sdk';
	import {goto} from '$app/navigation';
	import {globalNostrContext, globalRunes, me} from '@src/stores/profile.svelte';
	import {DynamicSubscription, DynamicSynchronisedSession} from '@nostream/sdk/ses';
	import {CommunityNostrContext} from '@nostream/sdk/communities';
	import type {TrustedEvent} from '@red-token/welshman/util';
	import {Nip35TorrentEvent, NostrUserProfileMetaData, UserType} from '@nostream/sdk/nips';

	let events: Nip35TorrentEvent[] = $state([]);

	// TODO mage a get or default
	let channelOwner: NostrUserProfileMetaData = $derived.by(() => {
		const profile = globalRunes.profiles.get(page.params.pubkey);
		return profile?.nip01Event?.profile ?? new NostrUserProfileMetaData();
	});

	onMount(async () => {
		globalRunes.nip01Events
			.values()
			.filter((c) => c.type === UserType.COMMUNITY)
			.forEach((community) => {
				const cnc = new CommunityNostrContext(community.pubkey, globalNostrContext);

				const session = new DynamicSynchronisedSession(cnc.relays);
				const sub = new DynamicSubscription(session, [
					{
						kinds: [Nip35TorrentEvent.KIND],
						authors: [page.params.pubkey]
					}
				]);

				session.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
					if (event.kind === Nip35TorrentEvent.KIND) {
						const te = Nip35TorrentEvent.buildFromEvent(event);

						if (te.event === undefined) throw Error(`Unknown event: ${event}`);
						events.push(te);
					} else {
						console.log('Unknown event ', event);
					}
				});
			});
	});

	// const url = 'wss://relay.stream.labs.h3.se';
	// const relays = [normalizeRelayUrl(url)];
	//
	// NostrClient.getInstance()
	//     .createSession(relays)
	//     .then((session) => {
	//         session;
	//
	//     });

	function view(event: Nip35TorrentEvent) {
		console.log('view', event);
		goto(`/view/infoHash/${event.x}`);
	}

	function follow() {
		// BELOW IS NOT HOW WE SHALL FOLLOW, we have a GLOBAL follow list
		// // TODO: We have to make this more precis now we follow a person with all identities and in all communities
		// communities.forEach((community) => {
		//
		// 	community.identities.value.forEach((communityIdentity: CommunityIdentity) => {
		// 		const msg = new Nip02FollowListEvent([...communityIdentity., new Followee(page.params.pubkey)]);
		// 		communityIdentity.followPublisher.publish(Nip02FollowListEvent.KIND, msg.opts);
		// 	});
		// });
	}
</script>

<div class="channel-container">
	<div class="channel-header">
		<div class="banner-container">
			{#if channelOwner.banner}
				<img class="channel-banner" src={channelOwner.banner} alt="Channel banner" loading="lazy" />
			{:else}
				<div class="banner-placeholder"></div>
			{/if}

			{#if channelOwner.picture}
				<img class="channel-avatar" src={channelOwner.picture} alt="Channel avatar" loading="lazy" />
			{:else}
				<div class="avatar-placeholder">
					{channelOwner.name?.charAt(0) || '?'}
					<!-- TODO fix the correct rendering of the first letter of the name in the avatar circle -->
				</div>
			{/if}
		</div>

		<div class="channel-info">
			<div class="channel-meta">
				<h1 class="channel-name">{channelOwner.name}</h1>
				<div class="channel-pubkey" title={page.params.pubkey}>
					{page.params.pubkey.slice(0, 8)}...{page.params.pubkey.slice(-8)}
				</div>
			</div>
			{#if me.pubkey !== '' && page.params.pubkey !== me.pubkey}
				<button class="follow-btn" onclick={follow}>
					Follow
					<svg class="follow-icon" viewBox="0 0 24 24">
						<path
							d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>

	<div class="events-list">
		{#each events as event}
			<div class="event-card">
				<div class="event-content">
					<h2 class="event-title">{event.title}</h2>
					<p class="event-x">{event.x}</p>
				</div>
				<button class="view-btn" onclick={() => view(event)}>
					VIEW
					<svg class="arrow-icon" viewBox="0 0 24 24">
						<path d="M6.4 18 5 16.6 14.6 7H6V5h12v12h-2V8.4Z" />
					</svg>
				</button>
			</div>
		{/each}
	</div>
</div>

<style>
	.channel-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.channel-header {
		background: var(--bg-1);
		border-radius: 16px;
		border: 1px solid var(--border-color);
		box-shadow: 0 4px 12px var(--shadow-color);
		margin-bottom: 2rem;
		overflow: hidden;
	}

	.banner-container {
		position: relative;
		height: 240px;
		background: var(--bg-2);
	}

	.channel-banner {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0.9;
	}

	.banner-placeholder {
		height: 100%;
		background: linear-gradient(135deg, var(--bg-2) 0%, var(--border-color) 100%);
	}

	.channel-avatar {
		position: absolute;
		bottom: -48px;
		left: 32px;
		width: 120px;
		height: 120px;
		border-radius: 50%;
		border: 3px solid var(--bg-1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		object-fit: cover;
		/* TODO fix the margin between the avatar and the name. */
	}

	.channel-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2rem 32px 32px;
	}

	.channel-name {
		font-size: 2rem;
		margin: 0 0 0.5rem;
		color: var(--text-primary);
	}

	.channel-pubkey {
		font-size: 0.9rem;
		color: var(--text-tertiary);
		word-break: break-all;
	}

	.follow-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.5rem;
		background: var(--accent-color);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		transition:
			transform 0.2s ease,
			background 0.3s ease;
	}

	.follow-btn:hover {
		background: var(--accent-hover);
		transform: translateY(-1px);
	}

	.follow-icon {
		width: 20px;
		height: 20px;
		fill: currentColor;
	}

	.events-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.event-card {
		background: var(--bg-1);
		position: relative;
		padding-right: 120px;
		border-radius: 12px;
		border: 1px solid var(--border-color);
		padding: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: transform 0.3s ease;
	}

	.event-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 4px 12px var(--shadow-hover);
	}

	.event-content {
		flex: 1;
		margin-right: 1rem;
		max-width: calc(100% - 140px);
		overflow: hidden;
	}

	.event-title {
		font-size: 1.1rem;
		margin: 0 0 0.5rem;
		color: var(--text-primary);
	}

	.event-x {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.view-btn {
		position: absolute;
		top: 50%;
		margin-left: 0;
		display: flex;
		right: 1.5rem;
		background: var(--bg-2);
		color: var(--fg-2);
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1.25rem;
		background: transparent;
		border: 2px solid var(--border-color);
		border-radius: 6px;
		transform: translateY(-50%);
		transition: all 0.3s ease;
		margin-left: auto;
	}

	.view-btn:hover {
		background: var(--accent-color);
		color: white;
	}

	@media (max-width: 768px) {
		.event-card {
			padding-right: 1rem;
			padding-bottom: 3.5rem;
		}

		.channel-header {
			border-radius: 12px;
		}

		.banner-container {
			height: 180px;
		}

		.channel-avatar {
			width: 80px;
			height: 80px;
			bottom: -32px;
			left: 16px;
		}

		.channel-info {
			flex-direction: column;
			align-items: flex-start;
			padding: 1.5rem 16px;
		}

		.channel-name {
			font-size: 1.5rem;
		}

		.follow-btn {
			margin-top: 1rem;
			width: 100%;
			justify-content: center;
		}

		.view-btn {
			top: auto;
			bottom: 1rem;
			right: 1rem;
			transform: none;
		}

		.events-list {
			grid-template-columns: 1fr;
		}

		.event-content {
			max-width: 100%;
		}
	}
</style>
