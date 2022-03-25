import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'loop',
	aliases: ['repeat', 'queue-repeat', 'queue-loop'],
	description: 'Starts looping your currently playing track or the whole queue.',
	fullCategory: ['music']
})
export class LoopCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		if (!message.guild) return;
		if (!message.member) return;
		if (!message.guild.me) return;

		const erelaPlayer = this.container.client.manager.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const userVoiceChannel = message.member.voice.channel;
		const botVoiceChannel = message.guild.me.voice.channel;

		try {
			const loopMode = await args.rest('string');

			if (!userVoiceChannel) {
				embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
				return message.channel.send({ embeds: [embedReply] });
			}

			if (erelaPlayer && botVoiceChannel && userVoiceChannel.id !== botVoiceChannel.id) {
				embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!');
				return message.channel.send({ embeds: [embedReply] });
			}

			if (!erelaPlayer) {
				embedReply.setDescription("There isn't an active player on this server!");
				return message.channel.send({ embeds: [embedReply] });
			}

			if ((!erelaPlayer.playing && !erelaPlayer.paused) || !erelaPlayer.queue.current) {
				embedReply.setDescription("There's nothing currently playing on this server!");
				return message.channel.send({ embeds: [embedReply] });
			}

			switch (loopMode) {
				case 'track':
				case 'current': {
					erelaPlayer.setTrackRepeat(true);
					embedReply.setDescription('Now looping the **current track**.');
					break;
				}
				case 'all':
				case 'queue': {
					erelaPlayer.setQueueRepeat(true);
					embedReply.setDescription('Now looping the **queue**.');
					break;
				}
				case 'disable':
				case 'off': {
					if (erelaPlayer.trackRepeat) {
						erelaPlayer.setTrackRepeat(false);
					}

					if (erelaPlayer.queueRepeat) {
						erelaPlayer.setQueueRepeat(false);
					}

					embedReply.setDescription('Looping is now **disabled**.');
					break;
				}
				default: {
					embedReply.setDescription('Invalid loop mode, the valid modes are: `current` `queue` `off`.');
				}
			}

			return message.channel.send({ embeds: [embedReply] });
		} catch (error: any) {
			if (error.identifier === 'argsMissing') {
				if (!userVoiceChannel) {
					embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
					return message.channel.send({ embeds: [embedReply] });
				}

				if (erelaPlayer && botVoiceChannel && userVoiceChannel.id !== botVoiceChannel?.id) {
					embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!');
					return message.channel.send({ embeds: [embedReply] });
				}

				if (!erelaPlayer) {
					embedReply.setDescription("There isn't an active player on this server!");
					return message.channel.send({ embeds: [embedReply] });
				}

				if ((!erelaPlayer.playing && !erelaPlayer.paused) || !erelaPlayer.queue.current) {
					embedReply.setDescription("There's nothing currently playing on this server!");
					return message.channel.send({ embeds: [embedReply] });
				}

				if (erelaPlayer.trackRepeat) {
					erelaPlayer.setTrackRepeat(false);
					erelaPlayer.setQueueRepeat(true);
					embedReply.setDescription('Now loping the **queue**.');
					return message.channel.send({ embeds: [embedReply] });
				}

				if (erelaPlayer.queueRepeat) {
					erelaPlayer.setQueueRepeat(false);
					embedReply.setDescription('Looping is now **disabled**.');
					return message.channel.send({ embeds: [embedReply] });
				}

				if (!erelaPlayer.trackRepeat && !erelaPlayer.queueRepeat) {
					erelaPlayer.setTrackRepeat(true);
					embedReply.setDescription('Now looping the **current track**.');
					return message.channel.send({ embeds: [embedReply] });
				}
			}

			this.container.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.channel.send({ embeds: [embedReply] });
		}
	}
}
