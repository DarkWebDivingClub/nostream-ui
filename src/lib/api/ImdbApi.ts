async function callImdbApi(url: string) {
	const res = await fetch(url);
	if (res.ok) return await res.json();

	throw new Error('Could not find info');
}

const DEFAULT_IMDB_API = 'https://imdb.stream.labs.h3.se';

function resolveImdbApiBaseUrl() {
	const configured = import.meta.env.VITE_IMDB_API?.trim();
	const base = configured && configured.length > 0 ? configured : DEFAULT_IMDB_API;
	return base.replace(/\/+$/, '');
}

export class ImdbApi {
	api = resolveImdbApiBaseUrl();

	async getInfo(imdbId: string) {
		return callImdbApi(`${this.api}/info/${imdbId}`);
	}

	async getInfoOnSeason(imdbId: string, season: number) {
		return callImdbApi(`${this.api}/info/${imdbId}/${season}`);
	}

	async getInfoOnEpisode(imdbId: string, season: number, episode: number) {
		return callImdbApi(`${this.api}/info/${imdbId}/${season}/${episode}`);
	}

	async searchTitle(title: string) {
		return callImdbApi(`${this.api}/search?title=${title}`);
	}
}

const imdbApi = new ImdbApi();
export default imdbApi;
