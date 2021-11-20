/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'nightcore',
	description: 'Toggles nightcore mode.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		const embedReply = new MessageEmbed();
		try {
			if (!message.guild) return;
			const erelaPlayer = this.container.client.players.get(
				message.guild.id
			);
			const data = {
				op: 'filters',
				guildId: message.guild.id,
				timescale: {
					speed: 1.2999999523162842,
					pitch: 1.2999999523162842,
					rate: 1
				}
			};
			await erelaPlayer?.node.send(data);
			return message.reply(':(');
		} catch (error: any) {
			this.container.client.logger.error(
				`There was an unexpected error in command "${this.name}"`,
				error
			);
			embedReply.setDescription(
				'There was an unexpected error while processing the command, try again later.'
			);
			return message.reply({ embeds: [embedReply] });
		}
	}
}
