export const ssr = false;

export function load({url}: {url: URL}) {
	return {
		hash: url.searchParams.get('hash') ?? ''
	};
}
