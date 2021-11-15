import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { registerSlashCommands } from '../../util/SlashCommandUtil/registerApplicationCommands';

@ApplyOptions<CommandOptions>({
	aliases: ['rsc'],
	description: 'Registers slash commands globally or in a guild.',
	quotes: [],
	preconditions: ['OwnerOnly'],
	flags: ['global'],
	options: ['guildid']
})
export class UserCommand extends Command {
	public async messageRun(message: Message, _args: Args) {
		try {
			registerSlashCommands(true, message.guildId!);
		} catch (error) {}
	}
}
