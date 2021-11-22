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
export class SeekCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		if (!message.guild) return;
		if (!message.member) return;
		if (!message.guild.me) return;

		const erelaPlayer = this.container.client.manager.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const userVoiceChannel = message.member.voice.channel;
		const botVoiceChannel = message.guild.me.voice;
		const formatValidator = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/g;

		try {
			const seekAmmount = await args.rest('string');

			const timeArray = seekAmmount.split(':').map((value) => {
				return parseInt(value, 10);
			});

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

			if (!formatValidator.test(seekAmmount)) {
				embedReply.setDescription('Invalid time format!, usage: `%seek hh:mm:ss`, `%seek mm:ss`, `%seek ss`');
				return message.channel.send({ embeds: [embedReply] });
			}

			if (!erelaPlayer.queue.current?.isSeekable) {
				embedReply.setDescription("This track isn'ŧ seekable!");
				return message.channel.send({ embeds: [embedReply] });
			}

			let seekSeconds;

			switch (timeArray.length) {
				case 3: {
					seekSeconds = timeArray[0] * 3600 + timeArray[1] * 60 + +timeArray[2];
					break;
				}
				case 2: {
					seekSeconds = timeArray[0] * 60 + +timeArray[1];
					break;
				}
				case 1: {
					seekSeconds = timeArray[0];
					break;
				}
				default: {
					embedReply.setDescription('Invalid time format!, usage: `%seek hh:mm:ss`, `%seek mm:ss`, `%seek ss`');
					return message.channel.send({ embeds: [embedReply] });
				}
			}

			if (seekSeconds > erelaPlayer.queue.current?.duration! / 1000 - 1) {
				embedReply.setDescription("The specified time is longer that the current track's length!").setColor('RED');
				return message.channel.send({ embeds: [embedReply] });
			}

			erelaPlayer.seek(seekSeconds * 1000);
			return message.react('👌');
		} catch (error: any) {
			if (error.identifier === 'argsMissing') {
				embedReply.setDescription('You must specify the ammount of time to seek!');
				return message.channel.send({ embeds: [embedReply] });
			}

			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.channel.send({ embeds: [embedReply] });
		}
	}
}
