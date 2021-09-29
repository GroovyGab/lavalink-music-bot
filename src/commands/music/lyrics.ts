/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'lyrics',
	description: 'Displays lyrics for the currently playing track or the one specified.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async run(_message: Message) {
		try {
			return;
		} catch (error) {
			return;
		}
	}
}
