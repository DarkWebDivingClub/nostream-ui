import {describe, it, expect} from 'vitest';
import {normalizeRelayUrl, type TrustedEvent} from '@red-token/welshman/util';
import {EventType, type SignerData, SignerType, Subscription, SynchronisedSession} from 'iz-nostrlib';
// import {Nip35TorrentEvent} from 'iz-nostrlib/nips';
// import {DynamicSynchronisedSession, DynamicSubscription} from 'iz-nostrlib/ses';
import {asyncCreateWelshmanSession, CommunityNostrContext} from 'iz-nostrlib/communities';
// import {globalNostrContext} from '$lib/stores/profile.svelte';

describe('sum test', () => {
	it('adds 1 + 2 to equal 3', async () => {
		expect(1 + 2).toBe(3);

		const url = 'ws://127.0.0.1:7777';
		const relays = [normalizeRelayUrl(url)];

		const bobNSec = 'nsec1zsp48upz3vd64lwhx7me8utrxyfxuzdwvxhfld2q0ehs0ya9mlxs47v64q';
		const bobSignerData: SignerData = {type: SignerType.NIP01, nsec: bobNSec};

		const ws = await asyncCreateWelshmanSession(bobSignerData);
		//
		//
		//
		//
		// const c = new CommunityNostrContext(
		// 	globalNostrContext,
		// 	'iz-stream',
		// 	relays,
		// 	'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg'
		// );
		//
		// const ci = new CommunityIdentity(c, ws);
		//
		// const session = new DynamicSynchronisedSession(c.relays);
		//
		// const sub = new DynamicSubscription(
		// 	session,
		// 	[
		// 		{
		// 			kinds: [Nip35TorrentEvent.KIND]
		// 			// authors: [page.params.pubkey]
		// 		}
		// 	]
		// );
		//
		// const events = [];
		//
		// session.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
		// 	if (event.kind === Nip35TorrentEvent.KIND) {
		// 		const te = Nip35TorrentEvent.buildFromEvent(event);
		//
		// 		if (te.event === undefined) throw Error(`Unknown event: ${event}`);
		//
		// 		events.push(te);
		// 	} else {
		// 		console.log('Unknown event ', event);
		// 	}
		// });
	});
});
