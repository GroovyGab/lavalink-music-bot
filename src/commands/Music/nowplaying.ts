import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import { splitBar } from 'string-progressbar';

@ApplyOptions<CommandOptions>({
	name: 'nowplaying',
	aliases: ['np', 'current'],
	description: 'Shows the currently playing track.',
	fullCategory: ['music']
})
export class NowplayingCommand extends Command {
	public async messageRun(message: Message) {
		if (!message.guild) return;
		if (!message.member) return;
		if (!message.guild.me) return;

		const erelaPlayer = this.container.client.manager.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const userVoiceChannel = message.member.voice.channel;
		const botVoiceChannel = message.guild.me.voice.channel;

		try {
			if (!userVoiceChannel) {
				embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
				return await message.channel.send({ embeds: [embedReply] });
			}

			if (erelaPlayer && botVoiceChannel && userVoiceChannel.id !== botVoiceChannel.id) {
				embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!');
				return await message.channel.send({ embeds: [embedReply] });
			}

			if (!erelaPlayer) {
				embedReply.setDescription("There isn't an active player on this server!");
				return await message.channel.send({ embeds: [embedReply] });
			}

			if ((!erelaPlayer.playing && !erelaPlayer.paused) || !erelaPlayer.queue.current) {
				embedReply.setDescription("There's nothing currently playing on this server!");
				return await message.channel.send({ embeds: [embedReply] });
			}

			const trackIsStream = erelaPlayer.queue.current.isStream;
			const trackPosition = erelaPlayer.position;
			const trackLength = erelaPlayer.queue.current.duration!;

			const trackInfo = erelaPlayer.queue.current;
			const splitProgressBar = trackIsStream ? '' : splitBar(trackLength, trackPosition, 20, '▬', '🔵')[0];

			const trackProgress = trackIsStream ? '[◉ LIVE]' : `${this.msToHMS(trackPosition)}`;
			const totalTrackLength = trackIsStream ? '' : `${this.msToHMS(trackLength)}`;
			const embedFooter = trackIsStream ? trackProgress : `${splitProgressBar} ${trackProgress} / ${totalTrackLength}`;

			embedReply.setDescription(`[${trackInfo.title}](${trackInfo.uri}) [${trackInfo.requester}]`).setFooter(embedFooter);

			return await message.channel.send({
				embeds: [embedReply]
			});
		} catch (error: any) {
			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return await message.channel.send({ embeds: [embedReply] });
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
