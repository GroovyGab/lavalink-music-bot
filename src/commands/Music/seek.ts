/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'seek',
	description: 'Rewinds the player by your specified amount.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async messageRun(message: Message, _args: Args) {
		const embedReply = new MessageEmbed();
		try {
			return message.reply(':(');
		} catch (error: any) {
			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [embedReply] });
		}
	}
}
