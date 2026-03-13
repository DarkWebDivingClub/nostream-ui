<script lang="ts">
	import {onDestroy} from 'svelte';
	// // import { slideAndFade } from '@lib/transition';
	// // import { loadUserData, loginWithNip46 } from '@app/commands';
	// // import { clearModals } from '@app/modal';
	// // import { setChecked } from '@app/notifications';
	// // import { pushToast } from '@app/toast';
	// // import { PLATFORM_LOGO, PLATFORM_NAME, PLATFORM_URL, SIGNER_RELAYS } from '@app/state';
	import {Nip46Broker, type Nip46BrokerParams} from '@red-token/welshman/signer';
	import {addSession, nip46Perms} from '@red-token/welshman/app';
	// import { slideAndFade } from '@lib/transition';
	// import { loadUserData, loginWithNip46 } from '@app/commands';
	// import { clearModals } from '@app/modal';
	// import { setChecked } from '@app/notifications';
	// import { pushToast } from '@app/toast';
	// import { PLATFORM_LOGO, PLATFORM_NAME, PLATFORM_URL, SIGNER_RELAYS } from '@app/state';

	import {QRCode} from '@red-token/iz-svelte-library';
	import {NostrClient, type SignerData, SignerType} from '@nostream/sdk';
	import {me} from '@src/stores/profile.svelte';
	import {logIn} from '@src/stores/community.svelte';
	import {signerRelays} from '@src/config/config';

	const abortController = new AbortController();

	export const SIGNER_RELAYS = signerRelays;

	export const PLATFORM_URL = window.location.origin;

	export const PLATFORM_LOGO = PLATFORM_URL + '/pwa-192x192.png';

	export const PLATFORM_NAME = import.meta.env.VITE_PLATFORM_NAME;

	// const init = Nip46Broker.initiate({
	// 	perms: nip46Perms,
	// 	url: PLATFORM_URL,
	// 	name: PLATFORM_NAME,
	// 	relays: SIGNER_RELAYS,
	// 	image: PLATFORM_LOGO,
	// 	// url: PLATFORM_URL,
	// 	// name: PLATFORM_NAME,
	// 	// relays: SIGNER_RELAYS,
	// 	// image: PLATFORM_LOGO,
	// 	abortController
	// });

	let {closePopup}: {closePopup: Function} = $props();

	// const onSubmit = async () => {
	// 	const { pubkey, token, relays } = Nip46Broker.parseBunkerLink(bunker);
	//
	// import {QRCode} from '@red-token/iz-svelte-library';
	// import {NostrClient, type SignerData, SignerType} from '@nostream/sdk';
	// import {me} from '../../../stores/profile.svelte';
	// import {logIn} from '@src/stores/community.svelte';
	// import {Nip46Broker, type Nip46BrokerParams} from '@red-token/welshman/signer';
	// import {nip46Perms} from '@red-token/welshman/app';
	//
	// const abortController = new AbortController();
	//
	// // export const SIGNER_RELAYS = ['wss://relay.stream.labs.h3.se/'];
	// export const SIGNER_RELAYS = ['wss://relay.lxc/'];
	//
	// export const PLATFORM_URL = window.location.origin;
	//
	// export const PLATFORM_LOGO = PLATFORM_URL + '/pwa-192x192.png';
	//
	// export const PLATFORM_NAME = import.meta.env.VITE_PLATFORM_NAME;
	//
	// const init = Nip46Broker..initiate({
	// 	perms: nip46Perms,
	// 	url: PLATFORM_URL,
	// 	name: PLATFORM_NAME,
	// 	relays: SIGNER_RELAYS,
	// 	image: PLATFORM_LOGO,
	// 	// url: PLATFORM_URL,
	// 	// name: PLATFORM_NAME,
	// 	// relays: SIGNER_RELAYS,
	// 	// image: PLATFORM_LOGO,
	// 	abortController
	// });
	//
	// let {closePopup}: {closePopup: Function} = $props();
	//
	// // const onSubmit = async () => {
	// // 	const { pubkey, token, relays } = Nip46Broker.parseBunkerLink(bunker);
	// //
	// // 	// if we are in the loading state we just return, we should log here
	// // 	if (loading) {
	// // 		return;
	// // 	}
	// //
	// // 	// Sanity check
	// // 	if (!pubkey || relays.length === 0) {
	// // 		return pushToast({
	// // 			theme: 'error',
	// // 			message: 'Sorry, it looks like that\'s an invalid bunker link.'
	// // 		});
	// // 	}
	// //
	// // 	// we are now in the loading state
	// // 	loading = true;
	// //
	// // 	try {
	// // 		if (!(await loginWithNip46(token, { pubkey, relays }))) {
	// // 			return pushToast({
	// // 				theme: 'error',
	// // 				message: 'Something went wrong, please try again!'
	// // 			});
	// // 		}
	// //
	// // 		abortController.abort();
	// //
	// // 		await loadUserData(pubkey);
	// // 	} finally {
	// // 		loading = false;
	// // 	}
	// //
	// // 	clearModals();
	// // };
	//
	// // let bunker = '';
	// let loading = $state(false);
	//
	// init.result.then(async (remoteSignerPubkey) => {
	// 	if (remoteSignerPubkey) {
	// 		loading = true;
	//
	// 		const handler = {
	// 			pubkey: remoteSignerPubkey,
	// 			relays: SIGNER_RELAYS
	// 		};
	//
	// 		//TODO: This is an ugly way of solving the chicken and egg problem
	// 		const params: Nip46BrokerParams = {
	// 			handler,
	// 			secret: init.clientSecret
	// 		};
	//
	// 		const broker = Nip46Broker.get(params);
	// 		const userPubkey = await broker.getPublicKey();
	//
	// 		const sg: SignerData = {
	// 			pubkey: userPubkey,
	// 			type: SignerType.NIP46,
	// 			rpubkey: handler.pubkey,
	// 			relays: handler.relays,
	// 			secret: init.clientSecret
	// 		};
	//
	// 		logIn(sg);
	// 		closePopup();
	// 	}
	// });
	//
	// onDestroy(() => {
	// 	abortController.abort();
	// });
	// //TODO Should be add the clipboard on the qr field
	//
	// // <div>Connect your signer by scanning the QR code below or pasting a bunker link.</div>
	// // {#if !loading}
	// // <div class="login-bunker">
	// // <div class="qr-container">
	// // <QRCode code={init.nostrconnect} />
	// // </div>
	// // </div>
	// // {/if}
	// //
	// // <style>
	// // .login-bunker {
	// // 	margin: 1.5rem 0;
	// // 	padding: 1rem;
	// // 	background: var(--bg-2);
	// // 	border-radius: 8px;
	// // }
	// //
	// // .qr-container {
	// // 	border-radius: 12px;
	// // 	margin-top: 5px;
	// // 	margin-bottom: 5px;
	// // }
	// // 	</style>
	//
</script>
