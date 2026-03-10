//@ts-expect-ignore //TODO something needs to be done about this.
import SimplePeer from 'simple-peer/simplepeer.min.js';
//@ts-expect-ignore
import WebTorrent from 'webtorrent/dist/webtorrent.min.js';

const rtcConfig = {
	iceServers: [
		{
			urls: ['turn:turn.stream.labs.h3.se'],
			username: 'test',
			credential: 'testme'
		},
		{
			urls: ['stun:stun.stream.labs.h3.se'],
			username: 'test',
			credential: 'testme'
		}
	],
	iceTransportPolicy: 'all',
	iceCandidatePoolSize: 0
};

// export const wt: WebTorrent = new WebTorrent();


export const wt: WebTorrent = new WebTorrent({
	tracker: {
		rtcConfig: {
			...SimplePeer.config,
			...rtcConfig
		}
	}
});

// let options = {
// 	announce: ['wss://tracker.webtorrent.dev', 'wss://tracker.btorrent.xyz', 'wss://tracker.openwebtorrent.com'],
// 	maxWebConns: 500
// };

// navigator.serviceWorker.register('/sw.min.js', {scope: '/'}).then((reg) => {
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.min.js').then((reg) => {
		const worker = reg.active || reg.waiting || reg.installing;

		if (worker === null) throw new Error('Service worker not available!');

		function checkState(worker: ServiceWorker | null): boolean {
			return worker !== null && worker.state === 'activated' && wt.createServer({controller: reg}) !== null;
		}

		if (!checkState(worker)) {
			worker.addEventListener('statechange', ({target}) => checkState(target as ServiceWorker | null));
		}
	});
} else {
	console.warn('[iz-stream] serviceWorker API unavailable in this context, skipping webtorrent server registration');
}
