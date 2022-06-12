import { Command } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';

export class PlayCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'play',
			description: 'Loads your input and adds it to the queue; If there is no playing track, then it will start playing.',
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

		let erelaPlayer = this.container.client.manager.get(interaction.guild.id);
		const embedReply = new MessageEmbed();
		const warnEmbed = new MessageEmbed();
		const userVoiceChannel = interaction.guild.members.cache.get(interaction.user.id)?.voice.channel;
		const botVoiceChannel = interaction.guild.me.voice.channel;

		try {
			const search = interaction.options.getString('query');

			if (!search) return;

			if (!userVoiceChannel) {
				embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
				return interaction.reply({ embeds: [embedReply] });
			}

			if (erelaPlayer && botVoiceChannel && userVoiceChannel.id !== botVoiceChannel.id) {
				embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!');
				return interaction.reply({ embeds: [embedReply] });
			}

			const userVCBotPermissions = userVoiceChannel.permissionsFor(interaction.guild.me);

			if (!userVCBotPermissions.has('CONNECT')) {
				embedReply.setDescription('The "Connect" permission is needed in order to play music in the voice channel!');
				return interaction.reply({ embeds: [embedReply] });
			}

			if (!userVCBotPermissions.has('SPEAK')) {
				embedReply.setDescription('The "Speak" permission is needed in order to play music in the voice channel!');
				return interaction.reply({ embeds: [embedReply] });
			}

			const result = await this.container.client.manager.search(search, interaction.user);

			if (result.loadType === 'NO_MATCHES') {
				embedReply.setDescription("Couldn't find a result for the given search term!");
				return interaction.reply({ embeds: [embedReply] });
			}

			if (result.loadType === 'LOAD_FAILED') {
				embedReply.setDescription(result.exception?.message ? result.exception?.message : 'Failed to load one or more tracks!');
				return interaction.reply({ embeds: [embedReply] });
			}

			if (result.loadType === 'PLAYLIST_LOADED' && result.playlist && result.playlist?.duration <= 0) {
				embedReply.setDescription("That playlist's duration is too small!");
				return interaction.reply({ embeds: [embedReply] });
			}

			if (!erelaPlayer) {
				erelaPlayer = this.container.client.manager.create({
					guild: interaction.guild.id,
					voiceChannel: userVoiceChannel.id,
					textChannel: interaction.channel.id,
					selfDeafen: true,
					volume: parseInt(process.env['DEFAULT_VOLUME']!)
				});

				erelaPlayer.existingLeaveTimeout = false;
				erelaPlayer.connect();

				await this.container.client.sleep(1000);

				if (userVoiceChannel.type === 'GUILD_STAGE_VOICE') {
					const newVoiceChannelPerms = userVoiceChannel.permissionsFor(interaction.guild.me);

					if (
						newVoiceChannelPerms.has('MANAGE_CHANNELS') &&
						newVoiceChannelPerms.has('MUTE_MEMBERS') &&
						newVoiceChannelPerms.has('MOVE_MEMBERS')
					) {
						interaction.guild.me.voice.setSuppressed(false);
					} else {
						warnEmbed.setDescription(
							"The voice channel is a stage and the bot doesn't have the permissions:\n**Manage Channels**, **Mute Members** or **Move Members**,\nThese are needed in order to become a stage speaker automatically."
						);
						interaction.reply({ embeds: [warnEmbed] });
					}
				}
			}

			erelaPlayer.textChannel = interaction.channel.id;

			if (result.loadType === 'PLAYLIST_LOADED') {
				erelaPlayer.queue.add(result.tracks);

				await this.container.client.sleep(1000);

				if (!erelaPlayer.playing && !erelaPlayer.paused && erelaPlayer.queue.totalSize === result.tracks.length) erelaPlayer.play();

				const playlistLength = `**${result.tracks.length - 1}**`;

				embedReply.setDescription(
					`Queued [${result.tracks[0].title}](${result.tracks[0].uri ? result.tracks[0].uri : search}) and ${
						result.tracks.length - 1 <= 0 ? '**no**' : playlistLength
					} other tracks [${result.tracks[0].requester}]`
				);
				return interaction.reply({ embeds: [embedReply] });
			}

			erelaPlayer.queue.add(result.tracks[0]);

			if (!erelaPlayer.playing && !erelaPlayer.paused && !erelaPlayer.queue.size) erelaPlayer.play();

			embedReply.setDescription(
				`Queued [${result.tracks[0].title}](${result.tracks[0].uri ? result.tracks[0].uri : search}) [${result.tracks[0].requester}]`
			);
			return interaction.reply({ embeds: [embedReply] });
		} catch (error: any) {
			if (error.identifier === 'argsMissing') {
				embedReply.setDescription('You must specify a search term!');
				return interaction.reply({ embeds: [embedReply], ephemeral: true });
			}

			this.container.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return interaction.reply({ embeds: [embedReply], ephemeral: true });
		}
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) =>
					option.setName('query').setDescription('Youtube/Spotify/Raw Audio File/Search Query that you want to play.').setRequired(true)
				)
		);
	}
}
