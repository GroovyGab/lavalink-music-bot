import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'bass',
	description: 'Sets the player\'s bass boost setting; If you input "reset", it will disable bass boosting.',
	fullCategory: ['music']
})
export class BassBoostCommand extends Command {
	public async messageRun(message: Message) {
		if (!message.guild) return;
		if (!message.member) return;
		if (!message.guild.me) return;

		const embedReply = new MessageEmbed();
		
		try {
			const erelaPlayer = this.container.client.manager.get(message.guild.id);
			const data = {
				op: 'filters',
				guildId: message.guild.id,
				equalizer: [
					{ band: 0, gain: 0.3 },
					{ band: 1, gain: 0.335 },
					{ band: 2, gain: 0.335 },
					{ band: 3, gain: 0 },
					{ band: 4, gain: -0.25 },
					{ band: 5, gain: 0.075 },
					{ band: 6, gain: -0.225 },
					{ band: 7, gain: 0.115 },
					{ band: 8, gain: 0.175 },
					{ band: 9, gain: 0.225 },
					{ band: 10, gain: 0.275 },
					{ band: 11, gain: 0.3 },
					{ band: 12, gain: 0.275 },
					{ band: 13, gain: 0 }
				]
				/*equalizer: [
					{ band: 0, gain: 0.6 },
					{ band: 1, gain: 0.67 },
					{ band: 2, gain: 0.67 },
					{ band: 3, gain: 0 },
					{ band: 4, gain: -0.5 },
					{ band: 5, gain: 0.15 },
					{ band: 6, gain: -0.45 },
					{ band: 7, gain: 0.23 },
					{ band: 8, gain: 0.35 },
					{ band: 9, gain: 0.45 },
					{ band: 10, gain: 0.55 },
					{ band: 11, gain: 0.6 },
					{ band: 12, gain: 0.55 },
					{ band: 13, gain: 0 }
				]*/
			};
			await erelaPlayer?.node.send(data);
			return message.react('🔊');
		} catch (error: any) {
			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [embedReply] });
		}
	}
}
