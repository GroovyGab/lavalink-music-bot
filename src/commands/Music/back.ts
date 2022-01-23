import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'back',
	aliases: ['previous'],
	description: 'Skips to the previous song.',
	fullCategory: ['music'],
})
export class BackCommand extends Command {
	public async messageRun(message: Message) {
		if (!message.guild) return;
		if (!message.member) return;
		if (!message.guild.me) return;

		const erelaPlayer = this.container.client.manager.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const { channel: userVoiceChannel } = message.member.voice;
		const { channel: botVoiceChannel } = message.guild.me.voice;

		try {
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

			if (!erelaPlayer.queue.previous) {
				embedReply.setDescription("There's no previous song to go back to.");
				return message.channel.send({ embeds: [embedReply] });
			}

			if (erelaPlayer.queue.current) {
				erelaPlayer.queue.unshift(erelaPlayer.queue.current);
			}

			erelaPlayer.queue.unshift(erelaPlayer.queue.previous);
			erelaPlayer.stop();

			return await message.react('👌');
		} catch (error: any) {
			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.channel.send({ embeds: [embedReply] });
		}
	}
}
