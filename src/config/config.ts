function parseCsvList(value: string | undefined): string[] {
	return (value ?? '')
		.split(',')
		.map((item) => item.trim())
		.filter((item) => item.length > 0);
}

export const applicationRelay = import.meta.env.VITE_APPLICATION_RELAY;
export const defaultCommunityRelay = import.meta.env.VITE_DEFAULT_COMMUNITY_RELAY;

export const torrentAnnounceList = parseCsvList(import.meta.env.VITE_TORRENT_ANNOUNCE);
export const signerRelays = parseCsvList(import.meta.env.VITE_SIGNER_RELAYS);

export const devMode = import.meta.env.DEV;
export const packageMode = import.meta.env.MODE;
export const package_Mode = import.meta.env.PACKAGE_MODE === 'true';
export const baseUrls = import.meta.env.BASE_URL;
