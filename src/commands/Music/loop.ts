/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

/**
 * Command options.
 */
@ApplyOptions<CommandOptions>({
	name: 'loop',
	aliases: ['repeat'],
	description: 'Starts looping your currently playing track or the whole queue.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	/**
	 * The main command method.
	 * @returns
	 */
	public async messageRun(_message: Message, _args: Args) {}
}
