import {type SignerData} from '@nostream/sdk';
import {me} from '@src/stores/profile.svelte';
import {asyncCreateWelshmanSession, Identifier} from '@nostream/sdk/communities';

// const url = 'wss://relay.stream.labs.h3.se';
// const relays = [normalizeRelayUrl(url)];

// export const communities: CommunityNostrContext[] = $state([
// 	// new CommunityNostrContext('iz-stream', relays, 'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg')
// ]);

export function logIn(data: SignerData) {
	asyncCreateWelshmanSession(data).then(async (wsession) => {
		me.identifier = new Identifier(wsession);
		// me.identity = new Identity(globalNostrContext, identifier);
		// me.pubkey = wsession.pubkey;
		// const identity = new Identifier(wsession);
		// globalNostrContext.identities.set(wsession.pubkey, new Identity(globalNostrContext, identity));

		// globalNostrContext.profileService.nip02Map.addListener((keys) => {
		// 	if (!keys.includes(identity.pubkey))
		// 		return;
		//
		// 	const list = globalNostrContext.profileService.nip02Map.value.get(identity.pubkey)?.list ?? [];
		//
		// 	const xdr = list.filter((f) => globalNostrContext.profileService.nip01Map.value.get(f.pubkey)?.type === UserType.COMMUNITY);
		//
		// 	for (let l of list) {
		// 		const x = globalNostrContext.profileService.nip01Map.value.get(l.pubkey);
		// 	}
		//
		// });

		// We login to the static communities
		// TODO: What do we do here?
		// communities.forEach((community) => {
		// 	const ci = community.createCommunityIdentity(wsession);
		// });
	});
}

export function logOut() {
	// me.pubkey = '';
	me.identifier = undefined;
}
