/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

/**
 * Command options.
 */
@ApplyOptions<CommandOptions>({
	name: 'pause',
	description: 'Pauses your currently playing track.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	/**
	 * The main command method.
	 * @returns
	 */
	public async messageRun(message: Message) {
		if (!message.guild) return;
		const erelaPlayer = this.container.client.players.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const { channel: userVoiceChannel } = message.member?.voice!;
		const { channel: botVoiceChannel } = message.guild.me?.voice!;

		try {
			if (!userVoiceChannel) {
				embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
				return message.reply({ embeds: [embedReply] });
			}

			if (userVoiceChannel.id !== botVoiceChannel?.id) {
				embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!');
				return message.reply({ embeds: [embedReply] });
			}

			if (!erelaPlayer) {
				embedReply.setDescription("There isn't an active player on this server!");
				return message.reply({ embeds: [embedReply] });
			}

			if (!erelaPlayer.playing && !erelaPlayer.paused) {
				embedReply.setDescription("There's nothing currently playing on this server!");
				return message.reply({ embeds: [embedReply] });
			}

			if (erelaPlayer.paused) {
				embedReply.setDescription('The playback is already paused!').setColor('RED');
				return message.reply({ embeds: [embedReply] });
			}

			erelaPlayer.pause(true);
			return message.react('⏸️');
		} catch (error: any) {
			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [embedReply] });
		}
	}
}
