<script lang="ts">
	import {onMount} from 'svelte';
	import {defaultNip01, me} from '@src/stores/profile.svelte';
	import {Nip01UserMetaDataEvent, NostrUserProfileMetaData} from '@nostream/sdk/nip01';

	// TODO We need to fix this.
	// const ci = communities[0].identities.values().toArray()[0];

	// let publisher: Publisher = ci.profilePublisher;
	// let profile: NostrProfileMetaData =
	// 	profiles.get(ci.pubkey) !== undefined ? profiles.get(ci.pubkey) : new NostrProfileMetaData();

	// const x = JSON.stringify(me.profile?.nip01Event.profile ?? defaultNip01.profile);
	// const y = JSON.parse(x);

	function classToObject<T>(cls: T): any {
		return JSON.parse(JSON.stringify(cls));
	}

	let profile = $state(classToObject(me.profile?.nip01Event.profile ?? defaultNip01.profile));

	type imageLoad = 'picture' | 'banner';
	let urlInputs = {
		picture: true,
		banner: true
	};

	let tempUrls = $state({
		picture: profile.picture,
		banner: profile.banner
	});

	onMount(async () => {});

	//TODO This function not working. it needs to be fixed to
	// uploadold an image to 'https://image.nostr.build/{key}' or find a way to set base64 in the profile.picture .
	const handleAddImage = (event: any, type: imageLoad) => {
		const file: File = event?.target?.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				if (profile) profile[type] = e.target!.result; //TODO fix it
			};
			reader.readAsDataURL(file);
		}
	};

	function handleRemoveImage(type: imageLoad) {
		urlInputs[type] = false;
		tempUrls[type] = '';
		profile[type] = '';
	}

	function onUpdate() {
		// To send stuff we need to convert it back to a class
		const userData = new NostrUserProfileMetaData();
		Object.assign(userData, profile);
		me.publisher?.publish(new Nip01UserMetaDataEvent(userData));
		console.log(me.profile);
	}

	const toggleSource = (type: imageLoad) => {
		urlInputs[type] = !urlInputs[type];
		tempUrls[type] = '';
	};

	const saveUrl = (type: imageLoad) => {
		if (isValidUrl(tempUrls[type])) {
			profile[type] = tempUrls[type];
			urlInputs[type] = false;
		}
	};

	const isValidUrl = (url: string) => {
		const pattern = /^(https?:\/\/).+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
		return pattern.test(url);
	};
</script>

{#if profile}
	<div class="profile-edit">
		<div class="image-previews">
			<div class="image-preview avatar-section">
				{#if profile.picture}
					<img src={profile.picture} alt="profile" class="preview-img avatar" />
					<button onclick={() => handleRemoveImage('picture')} class="delete-btn">×</button>
				{/if}

				<div class="source-switcher">
					<button class:active={!urlInputs.picture} onclick={() => toggleSource('picture')}>Upload</button>
					<button class:active={urlInputs.picture} onclick={() => toggleSource('picture')}>URL</button>
				</div>

				{#if !urlInputs.picture}
					<label class="upload-label">
						<input type="file" accept="image/*" onchange={(e) => handleAddImage(e, 'picture')} class="file-input" />
						{profile.picture ? 'Change Avatar' : 'Select Avatar'}
					</label>
				{:else}
					<div class="url-input">
						<input type="url" bind:value={tempUrls.picture} placeholder="Enter avatar URL" class="url-field" />
						<button onclick={() => saveUrl('picture')} disabled={!isValidUrl(tempUrls.picture)} class="url-button">
							Save
						</button>
					</div>
				{/if}
			</div>

			<div class="image-preview banner-section">
				{#if profile.banner}
					<img src={profile.banner} alt="banner" class="preview-img banner" />
					<button onclick={() => handleRemoveImage('banner')} class="delete-btn">×</button>
				{/if}

				<div class="source-switcher">
					<button class:active={!urlInputs.banner} onclick={() => toggleSource('banner')}>Upload</button>
					<button class:active={urlInputs.banner} onclick={() => toggleSource('banner')}>URL</button>
				</div>

				{#if !urlInputs.banner}
					<label class="upload-label">
						<input type="file" accept="image/*" onchange={(e) => handleAddImage(e, 'banner')} class="file-input" />
						{profile.banner ? 'Change Banner' : 'Select Banner'}
					</label>
				{:else}
					<div class="url-input">
						<input type="url" bind:value={tempUrls.banner} placeholder="Enter banner URL" class="url-field" />
						<button onclick={() => saveUrl('banner')} disabled={!isValidUrl(tempUrls.banner)} class="url-button">
							Save
						</button>
					</div>
				{/if}
			</div>
		</div>

		<div class="form-fields">
			<div class="form-row">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label>Name:</label>
				<input type="text" bind:value={profile.name} class="form-input" />
			</div>

			<div class="form-row">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label>Display Name:</label>
				<input type="text" bind:value={profile.display_name} class="form-input" />
			</div>

			<div class="form-row">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label>About:</label>
				<textarea bind:value={profile.about} class="form-input textarea"></textarea>
			</div>

			<div class="form-row">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label>Website:</label>
				<input type="url" bind:value={profile.website} class="form-input" />
				{#if profile.website}
					<a href={profile.website} class="website-link" target="_blank">Visit Website</a>
				{/if}
			</div>

			<div class="form-row">
				<label class="checkbox-label">
					<input type="checkbox" bind:checked={profile.bot} class="checkbox" />
					Bot Account
				</label>
			</div>

			<button onclick={onUpdate} class="update-btn"> Update Profile </button>
		</div>
	</div>
{/if}

<style>
	.profile-edit {
		max-width: 800px;
		margin: 2rem auto;
		padding: 2rem;
		background: var(--bg-1);
		border-radius: var(--border-radius);
		box-shadow: 0 2px 8px var(--shadow-color);
	}

	.image-previews {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.image-preview {
		position: relative;
		padding: 1rem;
		background: var(--bg-2);
		border-radius: var(--border-radius);
	}

	.preview-img {
		display: block;
		object-fit: cover;
		border: 2px solid var(--border-color);
	}

	.preview-img.avatar {
		width: 200px;
		height: 200px;
		border-radius: 50%;
		margin: 0 auto 1rem;
	}

	.preview-img.banner {
		width: 100%;
		height: 150px;
		border-radius: var(--border-radius);
		margin-bottom: 1rem;
	}

	.delete-btn {
		position: absolute;
		top: 15px;
		right: 15px;
		width: 28px;
		height: 28px;
		border: none;
		border-radius: 50%;
		background: rgba(255, 185, 185, 0.8);
		color: white;
		cursor: pointer;
		font-size: 1.2rem;
		line-height: 1;
		transition: background 0.2s ease;
	}

	.delete-btn:hover {
		background: rgba(255, 0, 0, 1);
	}

	.source-switcher {
		display: none;
		/*display: flex;*/
		gap: 0.5rem;
		margin: 1rem 0;
		justify-content: center;
	}

	.source-switcher button {
		padding: 0.5rem 1rem;
		border: 1px solid var(--border-color);
		background: var(--bg-2);
		color: var(--fg-2);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.source-switcher button.active {
		background: var(--accent-color);
		color: white;
		border-color: var(--accent-color);
	}

	.upload-label {
		display: block;
		padding: 0.75rem;
		background: var(--bg-3);
		color: var(--text-primary);
		text-align: center;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.upload-label:hover {
		background: var(--border-color);
	}

	.file-input {
		display: none;
	}

	.url-input {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.url-field {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		background: var(--bg-1);
		color: var(--fg-1);
	}

	.url-button {
		padding: 0.5rem 1.5rem;
		background: var(--accent-color);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: filter 0.2s ease;
	}

	.url-button:disabled {
		background: var(--bg-3);
		cursor: not-allowed;
		opacity: 0.7;
	}

	.form-fields {
		display: grid;
		gap: 1.5rem;
	}

	.form-row {
		display: grid;
		gap: 0.5rem;
	}

	label {
		color: var(--text-secondary);
		font-weight: 500;
		font-size: 0.9rem;
	}

	.form-input {
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		background: var(--bg-1);
		color: var(--text-primary);
		font-size: 1rem;
	}

	.textarea {
		min-height: 100px;
		resize: vertical;
	}

	.website-link {
		display: inline-block;
		margin-top: 0.5rem;
		color: var(--accent-color);
		text-decoration: none;
		font-size: 0.9rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		user-select: none;
	}

	.checkbox {
		width: 18px;
		height: 18px;
		accent-color: var(--accent-color);
	}

	.update-btn {
		width: 100%;
		padding: 1rem;
		background: var(--accent-color);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: filter 0.2s ease;
	}

	.update-btn:hover {
		filter: brightness(1.1);
	}

	@media (max-width: 768px) {
		.profile-edit {
			padding: 1rem;
			margin: 1rem;
		}

		.image-previews {
			grid-template-columns: 1fr;
		}

		.preview-img.avatar {
			width: 150px;
			height: 150px;
		}

		.preview-img.banner {
			height: 100px;
		}
	}
</style>
