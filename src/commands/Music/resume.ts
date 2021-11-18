/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

/**
 * Command options.
 */
@ApplyOptions<CommandOptions>({
	name: 'resume',
	description: 'Resume your currently playing track.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async messageRun(_message: Message) {}
}
