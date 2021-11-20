/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'skip',
	description: 'Skips to the next song.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		if (!message.guild) return;
		const erelaPlayer = this.container.client.players.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const { channel: userVoiceChannel } = message.member?.voice!;
		const { channel: botVoiceChannel } = message.guild.me?.voice!;

		try {
			const skipAmmount = await args.rest('integer');

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

			if (skipAmmount > erelaPlayer.queue.length + 1) {
				embedReply.setDescription("The ammount of songs to be skipped can't be larger than que queue's length!");
				return message.reply({ embeds: [embedReply] });
			}

			erelaPlayer.stop(skipAmmount);
			return message.react('👌');
		} catch (error: any) {
			if (error.identifier === 'argsMissing') {
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

				if (!erelaPlayer.playing) {
					embedReply.setDescription("There's nothing currently playing on this server!");
					return message.reply({ embeds: [embedReply] });
				}

				erelaPlayer.stop();
				return message.react('👌');
			}

			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [embedReply] });
		}
	}
}
