/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'skip',
	description: 'Skips to the next song.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async messageRun(_message: Message) {}
}
