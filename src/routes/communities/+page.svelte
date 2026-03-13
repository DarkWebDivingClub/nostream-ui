<script lang="ts">
	import {globalRunes} from '@src/stores/profile.svelte';
	import {UserType} from '@nostream/sdk/nips';
	import {Profile2} from '$components';
	import {goto} from '$app/navigation';

	// let cred = $state({nsec: 'nsec16lc2cn2gzgf3vcv20lwkqquprqujpkq9pj0wcxmnw8scxh6j0yrqlc9ae0'});
	//
	// let profile = $state({
	// 	data: new NostrUserProfileMetaData('Big Fish', 'About me', 'https://pre-alfa.iz-stream.com/users/big-fish.jpg'),
	// 	relay: defaultCommunityRelay
	// });
	//
	// function join(pubkey: string): void {
	// 	console.log(pubkey);
	//
	// 	if (me.profile === undefined || me.publisher === undefined) return;
	//
	// 	const followees = me.profile.nip02Event.list
	// 		.reduce((map: Map<string, Followee>, element) => map.set(element.pubkey, element), new Map<string, Followee>())
	// 		.values()
	// 		.toArray();
	//
	// 	followees.push(new Followee(pubkey));
	//
	// 	me.publisher.publish(new Nip02FollowListEvent(followees));
	// }

	function gotoPage(key: string) {
		goto(`/communities/${key}`);
		console.log(key);
	}

	// nsec1f87t43zppv2ppl5k88laz894ucmqpu2wfftgg50chzwhqyzr6yfq7zdk8e
</script>

<!--<div>-->
<!--	Hello My Community-->
<!--	{#each me.communities as community, i}-->
<!--		<div>-->
<!--			{community}-->
<!--			{community.pubkey}-->
<!--			{i}-->

<!--		</div>-->
<!--		{globalRunes.profiles.get(community.pubkey)?.nip01Event.profile.name ?? 'Unnamed Community'}-->
<!--	{/each}-->
<!--</div>-->

<!--Hello ALL Community-->

<!--<div>-->
<!--	{#each globalRunes.ctest as key, i}-->
<!--		<div>{i}:{key}</div>-->
<!--	{/each}-->
<!--</div>-->
<!--TEST1-->
<!--<div>-->
<!--	{#each globalRunes.ctest.values().filter((key) => globalRunes.profiles.get(key)?.nip01Event.type === UserType.COMMUNITY) as key, i}-->
<!--		<div>{i}:{key}</div>-->
<!--	{/each}-->
<!--</div>-->
<!--TEST2-->
<!--<div>-->
<!--	{#each globalRunes.profiles.keys() as key, i}-->
<!--		<div>{i}:{key}</div>-->
<!--	{/each}-->
<!--</div>-->
<!--TEST4-->
<!--<div>-->
<!--	{#each globalRunes.zprof.keys() as key, i}-->
<!--		<div>{i}:{key} {globalRunes.zprof.get(key)?.profile.name}</div>-->
<!--	{/each}-->
<!--</div>-->

<!--TEST5-->
<div class="profiles-container">
	{#each globalRunes.nip01Events.values().filter((val) => val.type === UserType.COMMUNITY) as val, i}
		<Profile2 nip01Event={val} {i}>
			<button class="show-movies-btn" onclick={() => gotoPage(val.pubkey)}>
				Explore
				<svg class="arrow-icon" viewBox="0 0 24 24">
					<path d="M6.4 18 5 16.6 14.6 7H6V5h12v12h-2V8.4Z" />
				</svg>
			</button>
		</Profile2>
	{/each}
</div>

<!--TEST3-->
<!--<div>-->
<!--	{#each globalRunes.communities.keys() as key, i}-->
<!--		<div>{i}:{key}</div>-->
<!--	{/each}-->
<!--</div>-->

<!--<div class="profiles-container">-->
<!--	{#each globalRunes.profiles.values().filter(false) as community, i}-->
<!--		<div>-->
<!--			${community.nip01Event.profile.name}-->
<!--			<Profile key={community.nip01Event.pubkey} i={i}></Profile>-->
<!--		</div>-->
<!--		<button onclick={() => join(community.nip01Event.pubkey)}>JOIN</button>-->
<!--	{/each}-->
<!--</div>-->

<style>
	.profiles-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
		padding: 2rem;
		max-width: 1440px;
		margin: 0 auto;
		z-index: 1;
	}

	.show-movies-btn {
		/* TODO fix the margin of the view button, reducing the margin between key and about. */
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--border-color);
		background: transparent;
		color: white;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		margin-left: auto;
		flex-shrink: 0;
		margin-left: auto;
		flex-shrink: 0;
		transition:
			transform 0.2s ease,
			background 0.3s ease;
	}

	.show-movies-btn:hover {
		background: var(--button-main);
		transform: translateY(-1px);
	}

	.arrow-icon {
		width: 18px;
		height: 18px;
		fill: currentColor;
	}

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
