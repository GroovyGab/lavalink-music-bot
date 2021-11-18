import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	aliases: ['filters'],
	description: 'A basic command with some subcommands',
	subCommands: ['karaoke', 'clear'],
	fullCategory: ['Music']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(_message: Message) {}
}
