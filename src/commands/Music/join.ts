/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'join',
	aliases: ['connect'],
	description: 'Joins your current voice channel.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		if (!message.guild) return;
		if (!message.member) return;
		if (!message.guild.me) return;

		let erelaPlayer = this.container.client.manager.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const { channel: userVoiceChannel } = message.member.voice;

		try {
			if (!userVoiceChannel) {
				embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
				return message.reply({ embeds: [embedReply] });
			}

			if (erelaPlayer) {
				embedReply.setDescription("There's already an active connection on this server!");
				return message.reply({ embeds: [embedReply] });
			}

			const userVCBotPermissions = userVoiceChannel.permissionsFor(message.guild.me!);

			if (!userVCBotPermissions.has('CONNECT')) {
				embedReply.setDescription('The "Connect" permission is needed in order to play music in the voice channel!');
				return message.reply({ embeds: [embedReply] });
			}

			if (!userVCBotPermissions.has('SPEAK')) {
				embedReply.setDescription('The "Speak" permission is needed in order to play music in the voice channel!');
				return message.reply({ embeds: [embedReply] });
			}

			erelaPlayer = this.container.client.manager.create({
				guild: message.guild.id,
				voiceChannel: message.member!.voice.channel!.id,
				textChannel: message.channel.id,
				selfDeafen: true,
				volume: 10
			});
			erelaPlayer.connect();
			return message.react('👌');
		} catch (error: any) {
			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [embedReply] });
		}
	}
}
