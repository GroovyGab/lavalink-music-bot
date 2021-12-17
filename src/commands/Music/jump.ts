import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'jump',
	aliases: ['skipto', 'jumpto'],
	description: 'Skips to the specified track.',
	fullCategory: ['music']
})
export class JumpCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		if (!message.guild) return;
		if (!message.member) return;
		if (!message.guild.me) return;

		const erelaPlayer = this.container.client.manager.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const userVoiceChannel = message.member.voice.channel;
		const botVoiceChannel = message.guild.me.voice.channel;

		try {
			const jumpTo = await args.rest('integer');

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

			if (jumpTo > erelaPlayer.queue.length + 1) {
				embedReply.setDescription("The number of the track to be jumped to can't be larger than que queue's length!");
				return message.channel.send({ embeds: [embedReply] });
			}

			erelaPlayer.stop(jumpTo);

			return await message.react('👌');
		} catch (error: any) {
			if (error.identifier === 'argsMissing') {
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

				embedReply.setDescription('You need to specify the number of the track to be jumped to!');
				return message.channel.send({ embeds: [embedReply] });
			}

			if (error.identifier === 'integerError') {
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

				console.log(this.lexer);

				embedReply.setDescription('The value of the track to be jumped to must be a number!');
				return message.channel.send({ embeds: [embedReply] });
			}

			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.channel.send({ embeds: [embedReply] });
		}
	}
}