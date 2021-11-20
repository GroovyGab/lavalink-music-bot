/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'queue',
	description: 'Shows the music queue.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		if (!message.guild) return;
		const embedReply = new MessageEmbed();
		try {
			const erelaPlayer = this.container.client.players.get(
				message.guild.id
			);
			const tracks = erelaPlayer?.queue.map(
				(track, i) =>
					`**${i + 1}** - ${track.title} | ${
						track.author
					} (requested by : ${track.requester})`
			);

			console.log(tracks);
			embedReply
				.setTitle(`**Queue for ${message.guild.name}**`)
				.setDescription(
					`__Now Playing:__\n[${erelaPlayer?.queue.current?.title}](${erelaPlayer?.queue.current?.uri})`
				);
			return message.reply({ embeds: [embedReply] });
		} catch (error: any) {
			this.container.client.logger.error(
				`There was an unexpected error in command "${this.name}"`,
				error
			);
			embedReply.setDescription(
				'There was an unexpected error while processing the command, try again later.'
			);
			return message.reply({ embeds: [embedReply] });
		}
	}
}
