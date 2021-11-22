/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'volume',
	description: 'Sets the player\'s volume; If you input "reset", it will set the volume back to default.',
	fullCategory: ['music']
})
export class VolumeCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		if (!message.guild) return;
		const erelaPlayer = this.container.client.manager.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const { channel: userVoiceChannel } = message.member?.voice!;
		const { channel: botVoiceChannel } = message.guild.me?.voice!;

		try {
			const volume = await args.rest('float');
			if (!userVoiceChannel) {
				embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
				return message.reply({ embeds: [embedReply] });
			}

			if (!erelaPlayer) {
				embedReply.setDescription("There isn't an active player on this server!");
				return message.reply({ embeds: [embedReply] });
			}

			if ((!erelaPlayer.playing && !erelaPlayer.paused) || !erelaPlayer.queue.current) {
				embedReply.setDescription("There's nothing currently playing on this server!");
				return message.reply({ embeds: [embedReply] });
			}

			if (erelaPlayer && botVoiceChannel && userVoiceChannel.id !== botVoiceChannel.id) {
				embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!');
				return message.reply({ embeds: [embedReply] });
			}

			if (!volume || volume < 0 || volume > 100) {
				embedReply.setDescription('The volume needs to be a value between 0 and 100.');
				return message.reply({ embeds: [embedReply] });
			}

			erelaPlayer.setVolume(volume);
			embedReply.setDescription(`The volume was changed to \`${volume}%\``);
			return message.reply({ embeds: [embedReply] });
		} catch (error: any) {
			if (error.identifier === 'argsMissing') {
				if (!userVoiceChannel) {
					embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
					return message.reply({ embeds: [embedReply] });
				}

				if (erelaPlayer && botVoiceChannel && userVoiceChannel.id !== botVoiceChannel.id) {
					embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!');
					return message.reply({ embeds: [embedReply] });
				}

				if (!erelaPlayer) {
					embedReply.setDescription("There isn't an active player on this server!");
					return message.reply({ embeds: [embedReply] });
				}

				if ((!erelaPlayer.playing && !erelaPlayer.paused) || !erelaPlayer.queue.current) {
					embedReply.setDescription("There's nothing currently playing on this server!");
					return message.reply({ embeds: [embedReply] });
				}

				embedReply.setDescription(`The volume is currently set at \`${erelaPlayer.volume}%\``);
				return message.reply({ embeds: [embedReply] });
			}

			if (error.identifier === 'floatError') {
				embedReply.setDescription(`The value must be a number!`);
				return message.reply({ embeds: [embedReply] });
			}

			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [embedReply] });
		}
	}
}
