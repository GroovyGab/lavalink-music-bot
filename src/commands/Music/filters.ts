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
	// Anyone should be able to view the result, but not modify
	public async karaoke(message: Message) {
		return message.channel.send('Karaoke filter on');
	}
	public async clear(message: Message) {
		return message.channel.send('cleared all music filters');
	}
}
