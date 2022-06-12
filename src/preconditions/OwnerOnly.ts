import { Precondition, Command } from '@sapphire/framework';
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

	public async chatInputRun(interaction: Command.ChatInputInteraction) {
		return OWNERS.includes(interaction.user.id)
			? this.ok()
			: this.error({
					message: 'This command can only be used by the owner.'
			  });
	}
}
