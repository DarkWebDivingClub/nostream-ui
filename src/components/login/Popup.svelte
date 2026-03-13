<script lang="ts">
	import {SignerType} from '@nostream/sdk';
	import {getNip07, type Nip07} from '@red-token/welshman/signer';
	import {onMount} from 'svelte';
	import {logIn} from '@src/stores/community.svelte';

	let {isOpen = false, closePopup}: {isOpen: boolean; closePopup: Function} = $props();

	let nip07: Nip07 | undefined = undefined;

	onMount(() => {
		nip07 = getNip07();
	});

	async function nip07LogIn() {
		if (nip07 === undefined) throw Error('No plugin found');

		const pubkey = await nip07.getPublicKey();

		const signerData = {type: SignerType.NIP07, pubkey: pubkey};
		console.log(signerData.pubkey);
		logIn(signerData);
		closePopup();
	}
</script>

{#if isOpen}
	<div class="popup-overlay" onclick={() => closePopup()}>
		<div class="popup" onclick={(event) => event.stopPropagation()}>
			{#if nip07 !== undefined}
				<button onclick={() => nip07LogIn()}>LogIn NIP07</button>
			{/if}
			<button onclick={() => closePopup()}>Close</button>
		</div>
	</div>
{/if}

<style>
	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--overlay-background);
		backdrop-filter: blur(4px);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		animation: fadeIn 0.3s ease;
	}

	.popup {
		background: var(--bg-1);
		border-radius: var(--border-radius);
		border: 1px solid var(--border-color);
		box-shadow: 0 8px 24px var(--shadow-color);
		padding: 2rem;
		width: 100%;
		max-width: 400px;
		position: relative;
		animation: slideIn 0.3s ease;
	}

	.popup h2 {
		color: var(--text-primary);
		margin: 0 0 1rem;
		font-size: 1.5rem;
	}

	.popup p {
		color: var(--text-secondary);
		margin: 0 0 1.5rem;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.popup button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.75rem;
		margin: 0.5rem 0;
		border: none;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.popup button:focus {
		outline: 2px solid var(--accent-color);
		outline-offset: 2px;
	}

	.popup button:first-of-type {
		background: var(--accent-color);
		color: white;
	}

	.popup button:last-of-type {
		background: transparent;
		border: 1px solid var(--border-color);
		color: var(--text-secondary);
	}

	.popup button:hover {
		filter: brightness(1.1);
	}

	.popup button:last-of-type:hover {
		background: var(--bg-3);
		border-color: var(--text-secondary);
		color: var(--text-primary);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideIn {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@media (max-width: 640px) {
		.popup {
			margin: 1rem;
			padding: 1.5rem;
			max-width: calc(100% - 2rem);
		}

		.popup h2 {
			font-size: 1.3rem;
		}

		.popup button {
			padding: 1rem;
		}
	}
</style>
