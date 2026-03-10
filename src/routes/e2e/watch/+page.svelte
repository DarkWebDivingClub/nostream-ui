<script lang="ts">
	import {VideoPlayer} from '$components';

	let {data} = $props<{data: {hash: string}}>();
</script>

{#if data.hash === ''}
	<p data-testid="missing-hash">Missing hash query param.</p>
{:else}
	<VideoPlayer infoHash={data.hash} />
{/if}
