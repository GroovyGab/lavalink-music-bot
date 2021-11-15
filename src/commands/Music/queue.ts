/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'queue',
	description: 'Shows the music queue.',
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
