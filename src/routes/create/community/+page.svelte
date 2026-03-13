<script lang="ts">
	import {asyncCreateWelshmanSession, Identifier, Identity} from '@nostream/sdk/communities';
	import {SignerType} from '@nostream/sdk';
	import {globalNostrContext} from '@src/stores/profile.svelte';
	import {DynamicPublisher} from '@nostream/sdk/ses';
	import {
		Nip01UserMetaDataEvent,
		Nip65RelayListMetadataEvent,
		NostrUserProfileMetaData,
		UserType
	} from '@nostream/sdk/nips';
	import {defaultCommunityRelay} from '@src/config/config';
	import {nip19} from 'nostr-tools';
	import {generateSecretKey, getPublicKey} from 'nostr-tools/pure';
	import {normalizeURL} from 'nostr-tools/utils';
	import {onMount} from 'svelte';
	import {fade} from 'svelte/transition';

	let cred = $state({nsec: ''});
	let isAdvancedOpen = $state(false);
	let showKey = $state(false);
	let isFormValid = true;
	let isAnimating = $state(false);

	let copyFeedback = $state(false);
	let feedbackTimeout: number;

	let profile = $state({
		data: new NostrUserProfileMetaData('', '', 'https://pre-alfa.iz-stream.com/users/big-fish.jpg'),
		relay: defaultCommunityRelay
	});
	let pubkey = $derived.by(() => {
		if (!cred.nsec.startsWith('nsec')) return 'Incorrect credentials';
		return nip19.npubEncode(getPublicKey(<Uint8Array<ArrayBufferLike>>nip19.decode(cred.nsec).data));
	});
	//TODO Solve it. A hack for only dev.

	function generate(): void {
		cred.nsec = nip19.nsecEncode(generateSecretKey());
	}

	function parseRelayText(relay: string): string[][] {
		return relay.split('\n').map((line: string) => [normalizeURL(line)]);
	}

	function create(): void {
		console.log('create' + profile);
		console.log(profile.relay);

		asyncCreateWelshmanSession({type: SignerType.NIP01, nsec: cred.nsec}).then((wsession) => {
			const identifier = new Identifier(wsession);
			const identity = new Identity(globalNostrContext, identifier);

			const relays: string[][] = parseRelayText(profile.relay);
			const publisher = new DynamicPublisher(globalNostrContext.profileService, identity);

			// TODO FIX THIS FFS! Where are my capabilities
			publisher.publish(
				new Nip01UserMetaDataEvent(
					profile.data,
					UserType.COMMUNITY,
					options.filter((o) => o.selected).map((o) => [o.name])
				)
			);
			publisher.publish(new Nip65RelayListMetadataEvent([[profile.relay]]));
		});
	}

	class Options {
		name: string = '';
		description: string = '';
		selected: boolean = $state(false);
		constructor(name: string, description: string, selected: boolean) {
			this.name = name;
			this.description = description;
			this.selected = selected;
		}
	}

	let options: Options[] = [new Options('nip35', 'Nip35', true), new Options('nip69', 'Nip69', false)];

	onMount(() => {
		generate();
	});

	const handleGenerate = () => {
		if (isAnimating) return;

		isAnimating = true;

		try {
			generate();

			setTimeout(() => {
				isAnimating = false;
			}, 800);
		} catch (e) {
			isAnimating = false;
			console.error('Generation failed:', e);
		}
	};
	const copyNsec = async (): Promise<void> => {
		try {
			if (!cred.nsec) {
				console.warn('Nothing to copy');
				return;
			}

			await navigator.clipboard.writeText(cred.nsec);
			showFeedback();
		} catch (err) {
			console.error('Failed to copy:', err);

			const textArea = document.createElement('textarea');
			textArea.value = cred.nsec;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
		}
	};

	const showFeedback = (): void => {
		copyFeedback = true;
		clearTimeout(feedbackTimeout);
		feedbackTimeout = window.setTimeout(() => {
			copyFeedback = false;
		}, 2000);
	};
	$inspect(options);
	///TODO
	//function for saving to .srt
	// function saveKeysAsFile(event: MouseEvent & {currentTarget: EventTarget & HTMLButtonElement}) {
	// 	throw new Error('Function not implemented.');
	// }

	// function testRelays(event: MouseEvent & {currentTarget: EventTarget & HTMLButtonElement}) {
	// 	throw new Error('Function not implemented.');
	// }

	// function loadDefaults(event: MouseEvent & {currentTarget: EventTarget & HTMLButtonElement}) {
	// 	throw new Error('Function not implemented.');
	// }

	// const toggleOption = (index: number) => {
	// 	options[index] = new Options(options[index].name, options[index].description, !options[index].selected);
	// };

	//TODO Add validation!
</script>

<div class="community-creator">
	<div class="key-section card">
		<div class="input-group">
			<label class="input-label">Private Key</label>
			<div class="input-wrapper">
				<input
					class="form-input code-input"
					bind:value={cred.nsec}
					type={showKey ? 'text' : 'password'}
					placeholder="nsec1..."
				/>
				<div class="input-actions">
					<button class="icon-btn ghost" onclick={copyNsec}>
						<!-- SVG Icon for Copy -->
						<svg class="icon" viewBox="0 0 24 24" width="20" height="20">
							<path
								fill="currentColor"
								d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12V1z"
							/>
						</svg>
					</button>
					<button class="icon-btn ghost" onclick={() => (showKey = !showKey)}>
						{#if showKey}
							<!-- Eye Closed SVG -->
							<svg class="icon" viewBox="0 0 24 24" width="20" height="20">
								<path
									fill="currentColor"
									d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3h-.17m-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22 21 20.73 3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7Z"
								/>
							</svg>
						{:else}
							<!-- Eye Open SVG -->
							<svg class="icon" viewBox="0 0 24 24" width="20" height="20">
								<path
									fill="currentColor"
									d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0Z"
								/>
							</svg>
						{/if}
					</button>
				</div>
				{#if copyFeedback}
					<div class="feedback-notification" transition:fade>Copied to clipboard!</div>
				{/if}
			</div>
		</div>
		<button class="btn generate" onclick={handleGenerate} class:animating={isAnimating}>
			<span class="btn-icon">
				<svg class="key-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
					<svg class="key-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="9" r="3" stroke="currentColor" stroke-width="1.5" fill="none" />
						<path d="M12 12V18M12 18H9V21H15V18H12Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
						<path d="M15 12L18 9L21 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				</svg></span
			>
			Generate Key
		</button>
	</div>

	<!-- Main Settings -->
	<div class="main-settings">
		<div class="card profile-section">
			<div class="input-group">
				<label class="input-label">Community Name</label>
				<input class="form-input" bind:value={profile.data.name} placeholder="Enter community name" />
			</div>

			<div class="input-group">
				<label class="input-label">Description</label>
				<input class="form-input" placeholder="About me" bind:value={profile.data.about} />
			</div>
		</div>

		<!-- Configuration Relay -->
		<div class="card relay-config">
			<div class="section-header">
				<span class="icon"></span>
				<h3>Relay Configuration</h3>
			</div>

			<div class="input-group">
				<input class="form-input code-block" bind:value={profile.relay} placeholder="wss://relay.lxc" />
			</div>
		</div>
	</div>

	<!-- Advanced Settings -->
	<div class="card advanced-section {isAdvancedOpen ? 'open' : ''}">
		<div class="accordion-header" onclick={() => (isAdvancedOpen = !isAdvancedOpen)}>
			<div class="header-content">
				<span class="icon">
					<svg width="20" height="20" viewBox="0 0 24 24">
						<path
							fill="currentColor"
							d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5A3.5 3.5 0 0 1 15.5 12A3.5 3.5 0 0 1 12 15.5M19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.5 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.5 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.94C7.96 18.34 8.5 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.5 18.68 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z"
						/>
					</svg>
				</span>
				Advanced Options
			</div>
			<div class="chevron">
				{#if isAdvancedOpen}
					<svg width="16" height="16" viewBox="0 0 24 24">
						<path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
					</svg>
				{:else}
					<svg width="16" height="16" viewBox="0 0 24 24">
						<path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
					</svg>
				{/if}
			</div>
		</div>

		{#if isAdvancedOpen}
			<div class="advanced-options">
				{#each options as option, i}
					<label class="option-item">
						<input
							class="sr-only"
							type="checkbox"
							bind:checked={option.selected}
							onclick={() => {
								option.selected = !option.selected;
							}}
						/>
						<div class="custom-checkbox {option.selected ? 'checked' : ''}">
							{#if option.selected}
								<svg class="checkmark" viewBox="0 0 12 10">
									<path fill="none" stroke="currentColor" stroke-width="2" d="M1 5l3 3 6-6" />
								</svg>
							{/if}
						</div>
						<div class="option-info">
							<div class="option-title">{option.name}</div>
						</div>
					</label>
				{/each}
			</div>
		{/if}
	</div>
	{#if pubkey}
		<div class="creator-footer">
			<button class="btn primary large" onclick={create} disabled={!isFormValid}> Create Community </button>
		</div>
	{/if}
</div>

<style>
	.community-creator {
		max-width: 780px;
		margin: 0 auto;
		padding: var(--nav-padding);
	}

	.card {
		background: var(--bg-1);
		/* background: radial-gradient(ellipse at right top, #005c8009  45%, #14181921 100%); */
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius);
		padding: 1.5rem;
		box-shadow: 0 4px 6px var(--shadow-color);
		margin-bottom: 1.5rem;
	}
	.card:hover {
		transform: translateY(-0.1px);
		box-shadow: 0 4px 12px var(--shadow-hover);
	}

	.key-section {
		background: var(--bg-1);
		border: 1px solid var(--accent-transparent);
	}

	.input-group {
		margin-bottom: 1.25rem;
	}

	.input-label {
		display: block;
		color: var(--fg-2);
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
	}

	.icon {
		vertical-align: middle;
	}
	.form-input {
		width: 100%;
		padding: 0.75rem 1rem;
		background: var(--bg-2);
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius-12);
		color: var(--fg-1);
	}

	.form-input::placeholder {
		color: var(--fg-3);
	}

	.form-input:focus {
		border-color: var(--accent-color);
		outline: none;
	}
	.input-wrapper {
		position: relative;
	}

	.input-actions {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		gap: 0.25rem;
	}

	/* Buttons */
	.btn {
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.5rem;
		border-radius: var(--border-radius-12);
		border: none;
		font-weight: 500;
		transition:
			transform 0.2s ease,
			background 0.3s ease;
	}

	.btn:active {
		transform: scale(0.95);
	}

	.btn.generate.animating .key-icon {
		animation: successSpin 0.8s ease-out;
	}

	@keyframes successSpin {
		0% {
			transform: rotate(0) scale(1);
		}
		30% {
			transform: rotate(60deg) scale(1.1);
		}
		70% {
			transform: rotate(-15deg) scale(0.95);
		}
		100% {
			transform: rotate(0) scale(1);
		}
	}

	.btn.generate:active .key-icon {
		transform: scale(0.95);
	}

	.btn.generate {
		border: solid 2px var(--border-color);
		display: inline-flex;
		background: transparent;
		color: var(--fg-1);
	}

	.btn.primary {
		display: flexbox;
		align-items: center;
		width: 100%;
		border: solid 2px var(--border-color);
		background: transparent;
		color: white;
		padding: 1rem 2rem;
	}

	.btn:hover {
		background: var(--button-main);
		filter: brightness(1.1);
		box-shadow: 0 4px 8px var(--accent-transparent);
		/* box-shadow: var(--shadow-hover); */
	}
	/* feedback */
	.feedback-notification {
		position: absolute;
		bottom: -30px;
		right: 0;
		background: var(--bg-3);
		color: var(--fg-1);
		padding: 8px 16px;
		border-radius: 4px;
		font-size: 14px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateY(10px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.fade {
		transition: opacity 0.3s;
	}
	/* Advanced Settings */

	.header-content {
		display: flex;
		gap: 0.5rem;
	}
	.advanced-section {
		background: var(--bg-2);
	}

	.accordion-header:hover {
		background: var(--bg-3);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}

	.option-item {
		display: flex;
		cursor: pointer;
		gap: 1rem;
		padding: 1rem;
		border-radius: var(--border-radius);
		margin-bottom: 0.5rem;
		background: var(--bg-2);
	}

	.advanced-section {
		transition: all 0.3s ease;
		overflow: hidden;
	}

	.accordion-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		cursor: pointer;
		border-radius: var(--border-radius);

		/* padding: 12px 16px; */
	}

	.chevron svg {
		transition: transform 0.2s;
	}

	.advanced-options {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 2px solid var(--bg-3);
	}

	.option-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px;
		border-radius: 6px;
		transition: background 0.2s;
	}

	.option-title {
		font-weight: 500;
		margin-bottom: 4px;
	}

	.option-desc {
		font-size: 0.9em;
		color: #666;
	}

	/* checkbox */
	.custom-checkbox {
		border: 2px solid var(--fg-2);
		flex-shrink: 0;
		transition: all 0.2s ease;
		width: 20px;
		height: 20px;
		/* border: 2px solid #ccc; */
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.custom-checkbox.checked {
		border-color: var(--accent-color);
		background: var(--accent-transparent);
	}

	.checkmark {
		width: 100%;
		height: 100%;
		/* mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E"); */
		/* background: var(--accent-color); */
		clip-path: polygon(28% 56%, 15% 44%, 6% 55%, 28% 76%, 88% 16%, 76% 6%, 28% 56%);
	}

	/* Editor Relay */
	/* .relay-config {
		border-left: 3px solid var(--accent-color);
	} */

	.code-block {
		font-size: 1rem;
		margin-top: 0.5rem;
		/* min-height: 100px; */
	}

	/* Foo */
	.creator-footer {
		margin-top: 2rem;
		text-align: center;
	}

	@media (max-width: 768px) {
		.community-creator {
			padding: 1rem;
		}

		.card {
			margin-left: -0.5rem;
			margin-right: -0.5rem;
			border-radius: 0;
			border-left: none;
			border-right: none;
		}
	}
</style>
