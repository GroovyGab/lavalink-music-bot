import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';

export class QueueCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'queue',
			description: 'Shows the music queue.',
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

			if (!erelaPlayer.queue.length) {
				const nowPlaying = erelaPlayer.queue.current
					? `__Now Playing:__\n[${erelaPlayer.queue.current.title}](${erelaPlayer.queue.current.uri}) - [${erelaPlayer.queue.current.requester}]\n\n`
					: '';
				embedReply.setDescription(`${nowPlaying}The queue is empty.`);
				return await interaction.reply({ embeds: [embedReply] });
			}

			const trackNamesArr = erelaPlayer?.queue.map((track, i) => `\`${i + 1}.\` [${track.title}](${track.uri}) - [${track.requester}]`);

			const trackNameArrChunks = trackNamesArr.reduce((resultArray: string[][], item, index) => {
				const chunkIndex = Math.floor(index / 10);
				if (!resultArray[chunkIndex]) {
					resultArray[chunkIndex] = [];
				}
				resultArray[chunkIndex].push(item);
				return resultArray;
			}, []);

			const queueTextArr = [];

			for (const item of trackNameArrChunks) {
				const trackName = item.join('\n');
				queueTextArr.push([trackName]);
			}

			const paginatedMessage = new PaginatedMessage({
				template: new MessageEmbed()
			});

			queueTextArr.forEach((textChunk) =>
				paginatedMessage.addPageEmbed((embed) =>
					embed.setDescription(
						`__Now Playing:__\n[${erelaPlayer.queue.current?.title}](${erelaPlayer.queue.current?.uri}) - [${erelaPlayer.queue.current?.requester}]\n\n${textChunk[0]}`
					)
				)
			);
			return await paginatedMessage.run(interaction, interaction.user);
		} catch (error: any) {
			this.container.logger.error(`There was an unexpected error in command "${this.name}"`, error);

			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return interaction.reply({ embeds: [embedReply] });
		}
	}
}
