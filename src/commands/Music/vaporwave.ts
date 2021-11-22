/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'vaporwave',
	description: 'Toggles vaporwave mode.',
	fullCategory: ['music']
})
export class VaporwaveCommand extends Command {
	public async messageRun(message: Message) {
		if (!message.guild) return;
		if (!message.member) return;
		if (!message.guild.me) return;

		const embedReply = new MessageEmbed();
		try {
			if (!message.guild) return;
			const erelaPlayer = this.container.client.manager.get(message.guild.id);
			const data = {
				op: 'filters',
				guildId: message.guild.id,
				equalizer: [
					{ band: 1, gain: 0.3 },
					{ band: 0, gain: 0.3 }
				],
				timescale: { pitch: 0.5 },
				tremolo: { depth: 0.3, frequency: 14 }
			};
			await erelaPlayer?.node.send(data);
			return message.reply(':(');
		} catch (error: any) {
			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [embedReply] });
		}
	}
}
