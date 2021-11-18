/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'move',
	description: 'Move a song to another position in the queue.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async messageRun(_message: Message) {}
}
