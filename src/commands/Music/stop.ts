/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'stop',
	description: 'Stop the current playback.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async messageRun(_message: Message) {
		try {
			return;
		} catch (error) {
			return;
		}
	}
}
