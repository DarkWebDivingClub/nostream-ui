import {describe, it} from 'vitest';
import {AbstractNipMiniEvent} from '@nostream/sdk';
import {createEvent, type CreateEventOpts, type TrustedEvent} from '@red-token/welshman/util';
import {own} from '@red-token/welshman/signer';
import {generateSecretKey, getPublicKey} from 'nostr-tools/pure';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

class AccessRequestChallengeMessage extends AbstractNipMiniEvent {
	public static KIND: number = 5670;

	private _memberships: string[];

	constructor(memberships: string[] = [], tags: string[][] = [], event?: TrustedEvent) {
		super(tags, event);
		this._memberships = memberships;
	}

	get kind() {
		return AccessRequestChallengeMessage.KIND;
	}

	get opts(): CreateEventOpts {
		const eTags = this._memberships.map((m) => ['p', m]);

		const tags = [...eTags, ...this.tags];

		return {
			tags,
			content: ''
		};
	}
}

describe('zaringa', () => {
	it('lets test this', async () => {
		console.log('test');

		const sk = generateSecretKey();
		const pk = getPublicKey(sk);

		const event = new AccessRequestChallengeMessage();

		const x = own(createEvent(event.kind, event.opts), pk);

		console.log(x);
	});
});
