/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'volume',
	description: 'Sets the player\'s volume; If you input "reset", it will set the volume back to default.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		const embedReply = new MessageEmbed();
		try {
			/*if (!message.guild) return;
			const data = {
				op: 'filters',
				guildId: message.guild.id,
				karaoke: {
					level: 1.0,
					monoLevel: 1.0,
					filterBand: 220.0,
					filterWidth: 100.0
				}
			};
			const a = await this.container.client.players.get(message.guild.id)?.node.send(data);
			return console.log(a);*/
			return;
		} catch (error: any) {
			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [embedReply] });
		}
	}
}
