import { Command } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import { splitBar } from 'string-progressbar';

export class NowPlayingCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'nowplaying',
			description: 'SDisplays info about the currently playing track.',
			chatInputCommand: {
				register: true
			}
		});
	}

	public async chatInputRun(interaction: Command.ChatInputInteraction) {
		if (!interaction.guild) return;
		if (!interaction.member) return;
		if (!interaction.guild.me) return;
		if (!interaction.channel) return;

		const erelaPlayer = this.container.client.manager.get(interaction.guild.id);
		const embedReply = new MessageEmbed();
		const userVoiceChannel = interaction.guild.members.cache.get(interaction.user.id)?.voice.channel;
		const botVoiceChannel = interaction.guild.me.voice.channel;

		try {
			if (!userVoiceChannel) {
				embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
				return interaction.reply({ embeds: [embedReply] });
			}

			if (erelaPlayer && botVoiceChannel && userVoiceChannel.id !== botVoiceChannel.id) {
				embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!');
				return interaction.reply({ embeds: [embedReply] });
			}

			if (!erelaPlayer) {
				embedReply.setDescription("There isn't an active player on this server!");
				return interaction.reply({ embeds: [embedReply] });
			}

			if ((!erelaPlayer.playing && !erelaPlayer.paused) || !erelaPlayer.queue.current) {
				embedReply.setDescription("There's nothing currently playing on this server!");
				return interaction.reply({ embeds: [embedReply] });
			}

			const trackIsStream = erelaPlayer.queue.current.isStream;
			const trackPosition = erelaPlayer.position;
			const trackLength = erelaPlayer.queue.current.duration!;

			const trackInfo = erelaPlayer.queue.current;
			const splitProgressBar = trackIsStream ? '' : splitBar(trackLength, trackPosition, 20, '▬', '🔵')[0];

			const trackProgress = trackIsStream ? '[◉ LIVE]' : `${this.msToHMS(trackPosition)}`;
			const totalTrackLength = trackIsStream ? '' : `${this.msToHMS(trackLength)}`;
			const embedFooter = trackIsStream ? trackProgress : `${splitProgressBar} ${trackProgress} / ${totalTrackLength}`;

			embedReply.setDescription(`[${trackInfo.title}](${trackInfo.uri}) [${trackInfo.requester}]`).setFooter({ text: embedFooter });

			return interaction.reply({
				embeds: [embedReply]
			});
		} catch (error: any) {
			this.container.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return interaction.reply({ embeds: [embedReply] });
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
