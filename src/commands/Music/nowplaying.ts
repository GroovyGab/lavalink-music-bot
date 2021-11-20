import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import {
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed
} from 'discord.js';
import { splitBar } from 'string-progressbar';

@ApplyOptions<CommandOptions>({
	name: 'nowplaying',
	aliases: ['np', 'current'],
	description: 'Shows the currently playing track.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		if (!message.guild) return;
		const erelaPlayer = this.container.client.players.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const replyInteractionRow = new MessageActionRow();
		const { channel: userVoiceChannel } = message.member?.voice!;
		const { channel: botVoiceChannel } = message.guild.me?.voice!;
		try {
			if (!userVoiceChannel) {
				embedReply.setDescription(
					'You have to be connected to a voice channel before you can use this command!'
				);
				return message.reply({ embeds: [embedReply] });
			}

			if (userVoiceChannel.id !== botVoiceChannel?.id) {
				embedReply.setDescription(
					'You need to be in the same voice channel as the bot before you can use this command!'
				);
				return message.reply({ embeds: [embedReply] });
			}

			if (!erelaPlayer) {
				embedReply.setDescription(
					"There isn't an active player on this server!"
				);
				return message.reply({ embeds: [embedReply] });
			}

			if (!erelaPlayer.playing && !erelaPlayer.paused) {
				embedReply.setDescription(
					"There's nothing currently playing on this server!"
				);
				return message.reply({ embeds: [embedReply] });
			}

			const trackIsStream = erelaPlayer.queue.current?.isStream;
			const trackPosition = erelaPlayer.position;
			const trackLength = erelaPlayer.queue.current?.duration!;

			const trackInfo = erelaPlayer.queue.current;
			const splitProgressBar = trackIsStream
				? ''
				: splitBar(trackLength, trackPosition, 20, '▬', '🔵')[0];

			const trackProgress = trackIsStream
				? '[◉ LIVE]'
				: `${this.msToHMS(trackPosition)}`;
			const totalTrackLength = trackIsStream
				? ''
				: `${this.msToHMS(trackLength)}`;
			const embedFooter = trackIsStream
				? trackProgress
				: `${splitProgressBar} ${trackProgress} / ${totalTrackLength}`;

			embedReply
				.setDescription(
					`[${trackInfo?.title}](${trackInfo?.uri}) [${trackInfo?.requester}]`
				)
				.setFooter(embedFooter);
			replyInteractionRow.addComponents(
				new MessageButton()
					.setLabel('Link')
					.setStyle('LINK')
					.setURL(trackInfo?.uri!)
			);
			return message.reply({
				embeds: [embedReply],
				components: [replyInteractionRow]
			});
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

	private msToHMS(ms: number) {
		let seconds = ms / 1000;

		const hours = Math.floor(seconds / 3600);
		seconds = seconds % 3600;

		const minutes = Math.floor(seconds / 60);

		seconds = Math.floor(seconds % 60);

		return `${hours}h ${minutes}m ${seconds}s`;
	}
}
