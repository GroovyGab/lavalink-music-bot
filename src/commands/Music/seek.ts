/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'seek',
	description: 'Rewinds the player by your specified amount.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async messageRun(_message: Message, _args: Args) {}
}
