import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { envParseArray } from '../lib/env-parser';

const OWNERS = envParseArray({ key: 'OWNERS' });

export class OwnerOnlyPrecondition extends Precondition {
	public async run(message: Message) {
		return OWNERS.includes(message.author.id)
			? this.ok()
			: this.error({
					message: 'This command can only be used by the owner.'
			  });
	}
}
