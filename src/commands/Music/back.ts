/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'back',
	description: 'Skips to the previous song.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		if (!message.guild) return;
		const erelaPLayer = this.container.client.players.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const { channel: userVoiceChannel } = message.member?.voice!;
		const { channel: botVoiceChannel } = message.guild.me?.voice!;

		try {
			if (!userVoiceChannel) {
				embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
				return message.reply({ embeds: [embedReply] });
			}

			if (!erelaPLayer) {
				embedReply.setDescription("There isn't an active player on this server!");
				return message.reply({ embeds: [embedReply] });
			}

			if (!erelaPLayer.playing && !erelaPLayer.paused) {
				embedReply.setDescription("There's nothing currently playing on this server!");
				return message.reply({ embeds: [embedReply] });
			}

			if (userVoiceChannel.id !== botVoiceChannel?.id) {
				embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!');
				return message.reply({ embeds: [embedReply] });
			}

			if (!erelaPLayer.queue.previous) {
				embedReply.setDescription("There's no previous song to go back to.");
				return message.reply({ embeds: [embedReply] });
			}

			erelaPLayer.queue.add(erelaPLayer.queue.previous);

			if (erelaPLayer.queue.current) {
				erelaPLayer.queue.add(erelaPLayer.queue.current);
			}

			erelaPLayer.stop();

			return message.react('👌');
		} catch (error: any) {
			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [embedReply] });
		}
	}
}
