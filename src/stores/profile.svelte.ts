import {SvelteMap, SvelteSet} from 'svelte/reactivity';
import {
	Followee,
	Nip01UserMetaDataEvent,
	Nip02FollowListEvent,
	Nip65RelayListMetadataEvent,
	NostrUserProfileMetaData,
	UserType
} from '@nostream/sdk/nips';
import {GlobalNostrContext, Identifier, Identity} from '@nostream/sdk/communities';
import {DynamicPublisher} from '@nostream/sdk/ses';
import {normalizeRelayUrl} from '@red-token/welshman/util';
import {setContext} from '@red-token/welshman/lib';
import {getDefaultAppContext, getDefaultNetContext} from '@red-token/welshman/app';
import {applicationRelay} from '@src/config/config';

// REBUILD THE WORLDS HERE
// TODO: FIX THIS
const relays = [normalizeRelayUrl(applicationRelay)];

setContext({
	net: getDefaultNetContext(),
	app: getDefaultAppContext()
});

export const globalNostrContext = new GlobalNostrContext(relays);

class GlobalRunes {
	nip01Events = $state(new SvelteMap<string, Nip01UserMetaDataEvent>());
	nip02Events = $state(new SvelteMap<string, Nip02FollowListEvent>());
	nip65Events = $state(new SvelteMap<string, Nip65RelayListMetadataEvent>());

	ctest = $state(new SvelteSet<string>());
	profiles = $state(new SvelteMap<string, NostrProfile>());
	services: Followee[] = $derived.by(() => {
		const fl = globalRunes.nip01Events
			.entries()
			.filter((val) => val[1].type === UserType.SERVICE)
			.toArray();
		return fl.map((val) => new Followee(val[0], undefined, val[1].profile.name));
	});

	// // communities: SvelteMap<string, NostrProfile> = $derived.by(() => {
	// // 	const communityMap = new SvelteMap<string, NostrProfile>();
	// // 	this.profiles.forEach((profile, key) => {
	// // 		if (profile.nip01Event.type === UserType.COMMUNITY) communityMap.set(key, profile);
	// // 	});
	// // 	return communityMap;
	// // });
	// // users: SvelteMap<string, NostrProfile> = $derived.by(() => {
	// // 	const userMap = new SvelteMap<string, NostrProfile>();
	// // 	this.profiles.forEach((profile, key) => {
	// // 		if (profile.nip01Event.type === undefined || profile.nip01Event.type === UserType.INDIVIDUAL) userMap.set(key, profile);
	// // 	});
	// // 	return userMap;
	// // });
	// communities: SvelteMap<string, NostrProfile> = $derived.by(() => {
	// 	const communityMap = new SvelteMap<string, NostrProfile>();
	// 	this.profiles.forEach((profile, key) => {
	// 		if (profile.nip01Event.type === UserType.COMMUNITY) communityMap.set(key, profile);
	// 	});
	// 	return communityMap;
	// });
	// users: SvelteMap<string, NostrProfile> = $derived.by(() => {
	// 	const userMap = new SvelteMap<string, NostrProfile>();
	// 	this.profiles.forEach((profile, key) => {
	// 		if (profile.nip01Event.type === undefined || profile.nip01Event.type === UserType.INDIVIDUAL)
	// 			userMap.set(key, profile);
	// 	});
	// 	return userMap;
	// });
}

export const globalRunes = new GlobalRunes();

// export const profiles = $state(new SvelteMap<string, NostrProfile>());

export const defaultNip01 = new Nip01UserMetaDataEvent(new NostrUserProfileMetaData('Who am I', 'I dont know', ''));
export const defaultNip02 = new Nip02FollowListEvent([]);
export const defaultNip65 = new Nip65RelayListMetadataEvent(relays.map((relay) => [relay]));

export class NostrProfile {
	constructor(
		public nip01Event: Nip01UserMetaDataEvent = defaultNip01,
		public nip02Event: Nip02FollowListEvent = defaultNip02,
		public nip65Event: Nip65RelayListMetadataEvent = defaultNip65
	) {}
}

globalNostrContext.profileService.nip01Map.addListener((keys) => {
	console.log('nip01', keys);

	for (const key of keys) {
		// globalRunes.ctest.add(key)
		// console.log("SET SF" + key)

		// const profile = new NostrProfile();
		const profile = globalRunes.profiles.get(key) ?? new NostrProfile();
		const prof = globalNostrContext.profileService.nip01Map.value.get(key) ?? defaultNip01;
		globalRunes.nip01Events.set(key, prof);

		profile.nip01Event = prof;
		// console.log("SET STUFF" + key)
		// globalRunes.profiles.set(key, profile);
		globalRunes.profiles.set(key, profile);
	}
});

globalNostrContext.profileService.nip02Map.addListener((keys) => {
	console.log('nip02', keys);
	for (const key of keys) {
		const profile = globalRunes.profiles.get(key) ?? new NostrProfile();
		const event = globalNostrContext.profileService.nip02Map.value.get(key) ?? defaultNip02;
		globalRunes.nip02Events.set(key, event);
		profile.nip02Event = event;
		globalRunes.profiles.set(key, profile);
	}
});

globalNostrContext.profileService.nip65Map.addListener((keys) => {
	console.log('nip65:', keys);
	for (const key of keys) {
		const profile = globalRunes.profiles.get(key) ?? new NostrProfile();
		const event = globalNostrContext.profileService.nip65Map.value.get(key) ?? defaultNip65;
		globalRunes.nip65Events.set(key, event);
		profile.nip65Event = event;
		globalRunes.profiles.set(key, profile);
	}
});

globalNostrContext.identities.addListener((keys) => {
	console.log('keys too2:', keys);

	for (const key of keys) {
		const npr = new NostrProfile(
			globalNostrContext.profileService.nip01Map.value.get(key) ?? defaultNip01,
			globalNostrContext.profileService.nip02Map.value.get(key) ?? defaultNip02,
			globalNostrContext.profileService.nip65Map.value.get(key) ?? defaultNip65
		);

		globalRunes.profiles.set(key, npr);
	}
});

// export function getOrCreateProfile(key: string) {
// 	let profile = profiles.get(key);
//
// 	if (profile === undefined) {
// 		profile = new NostrProfile();
// 		profiles.set(key, profile);
// 	}
//
// 	return profile;
// }

class Me {
	identifier = $state<Identifier>();
	identity: Identity | undefined = $derived(
		this.identifier !== undefined ? new Identity(globalNostrContext, this.identifier) : undefined
	);
	pubkey: string = $derived(this.identifier?.pubkey ?? '');
	profile = $derived(globalRunes.profiles.get(this.pubkey) || new NostrProfile());
	communities = $derived.by(() => {
		console.log('Updating CL');
		const list = globalRunes.nip02Events.get(me.pubkey)?.list ?? [];
		const fl = list.filter((f) => globalRunes.nip01Events.get(f.pubkey)?.type === UserType.COMMUNITY);
		// return fl
		// 	.reduce((map, element) => map.set(element.pubkey, element), new Map<string, Followee>())
		// 	.values()
		// 	.toArray();
		return fl;
	});
	publisher = $derived.by(() => {
		console.log('PUb TRIGGERED!');
		return this.identity != undefined
			? new DynamicPublisher(globalNostrContext.profileService, this.identity)
			: undefined;
	});
	// profilesSession: SynchronisedSession | undefined = undefined;
	// followees: Followee[] = $derived(profiles.get(this.pubkey)?.nip02Event.list ?? [])
	// listSession: SynchronisedSession | undefined = undefined;
	// listPublisher: Publisher | undefined = undefined;
	// notificationSession: SynchronisedSession | undefined = undefined;
	// notificationSubscription: Subscription | undefined;
	// transcodingBots: Followee[] = $derived.by(() => {
	// 	const fl = globalRunes.nip01Events
	// 		.entries()
	// 		.filter((val) => {
	// 			console.log(val[1].type);
	// 			console.log(UserType.SERVICE);
	// 			console.log(val[1].type === UserType.SERVICE);
	// 			return val[1].type === UserType.SERVICE;
	// 		})
	// 		.toArray();
	// 	return fl.map((val) => new Followee(val[0], undefined, val[1].profile.name));
	// 	//
	// 	// list.filter((f) => globalRunes.nip01Events.get(f.pubkey)?.type === UserType.COMMUNITY);
	// 	// // return fl
	// 	// // 	.reduce((map, element) => map.set(element.pubkey, element), new Map<string, Followee>())
	// 	// // 	.values()
	// 	// // 	.toArray();
	// 	// return fl;
	// 	//
	// 	//
	// 	// return [
	// 	// 	new Followee('b1e997f11f8d454eae2b2c1d52948e800df4e7103412d78984827eea2be138b2', undefined, 'Transcoding bot')
	// 	// ];
	// });
}

export const me = new Me();
