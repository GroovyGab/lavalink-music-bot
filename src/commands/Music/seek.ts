import { Command } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';

export class TwentyFourSevenCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'seek',
			description: 'Seeks to the specified timestamp in the currently playing song.',
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
		const formatValidator = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/g;

		try {
			const seekAmount = interaction.options.getString('seekto')!;

			const timeArray = seekAmount.split(':').map((value) => {
				return parseInt(value, 10);
			});

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

			if (!formatValidator.test(seekAmount)) {
				embedReply.setDescription('Invalid time format!, usage: `%seek hh:mm:ss`, `%seek mm:ss`, `%seek ss`');
				return interaction.reply({ embeds: [embedReply] });
			}

			if (!erelaPlayer.queue.current?.isSeekable) {
				embedReply.setDescription("This track isn't seekable!");
				return await interaction.reply({ embeds: [embedReply] });
			}

			let seekSeconds;

			switch (timeArray.length) {
				case 3: {
					seekSeconds = timeArray[0] * 3600 + timeArray[1] * 60 + +timeArray[2];
					break;
				}
				case 2: {
					seekSeconds = timeArray[0] * 60 + +timeArray[1];
					break;
				}
				case 1: {
					seekSeconds = timeArray[0];
					break;
				}
				default: {
					embedReply.setDescription('Invalid time format!, usage: `%seek hh:mm:ss`, `%seek mm:ss`, `%seek ss`');
					return interaction.reply({ embeds: [embedReply] });
				}
			}

			if (seekSeconds > erelaPlayer.queue.current?.duration! / 1000 - 1) {
				embedReply.setDescription("The specified time is longer that the current track's length!").setColor('RED');
				return interaction.reply({ embeds: [embedReply] });
			}

			erelaPlayer.seek(seekSeconds * 1000);
			return await interaction.reply('👌');
		} catch (error: any) {
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
					option.setName('seekto').setDescription('The timestamp in the song that you want to seek to.').setRequired(true)
				)
		);
	}
}
