import type {Nip35TorrentEvent} from '@nostream/sdk/nips';

export const s: {
	assets: Nip35TorrentEvent[];
	playing: Nip35TorrentEvent | undefined;
} = $state({
	assets: [],
	playing: undefined
});
