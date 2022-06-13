import { Command } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import type { Player } from 'erela.js';

export class LoopCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'loop',
			description: 'Starts looping your currently playing track or the whole queue.',
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

			const subcommand = interaction.options.getSubcommand();

			switch (subcommand) {
				case 'track': {
					return this.trackLoop(interaction, erelaPlayer, embedReply);
				}
				case 'queue': {
					return this.queueLoop(interaction, erelaPlayer, embedReply);
				}
				case 'off': {
					return this.offLoop(interaction, erelaPlayer, embedReply);
				}
			}

			/*case null: {
					if (erelaPlayer.trackRepeat) {
						erelaPlayer.setTrackRepeat(false);
						erelaPlayer.setQueueRepeat(true);
						embedReply.setDescription('Now loping the **queue**.');
						return interaction.reply({ embeds: [embedReply] });
					}

					if (erelaPlayer.queueRepeat) {
						erelaPlayer.setQueueRepeat(false);
						embedReply.setDescription('Looping is now **disabled**.');
						return interaction.reply({ embeds: [embedReply] });
					}

					if (!erelaPlayer.trackRepeat && !erelaPlayer.queueRepeat) {
						erelaPlayer.setTrackRepeat(true);
						embedReply.setDescription('Now looping the **current track**.');
						return interaction.reply({ embeds: [embedReply] });
					}
					break;
				}*/
		} catch (error: any) {
			this.container.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return interaction.reply({ embeds: [embedReply], ephemeral: true });
		}
	}

	public trackLoop(interaction: Command.ChatInputInteraction, erelaPlayer: Player, embedReply: MessageEmbed) {
		if (!interaction.guild) return;
		if (!interaction.member) return;
		if (!interaction.guild.me) return;
		if (!interaction.channel) return;

		erelaPlayer.setTrackRepeat(true);
		embedReply.setDescription('Now looping the **current track**.');
		return interaction.reply({ embeds: [embedReply] });
	}

	public queueLoop(interaction: Command.ChatInputInteraction, erelaPlayer: Player, embedReply: MessageEmbed) {
		if (!interaction.guild) return;
		if (!interaction.member) return;
		if (!interaction.guild.me) return;
		if (!interaction.channel) return;

		erelaPlayer.setQueueRepeat(true);
		embedReply.setDescription('Now looping the **queue**.');
		return interaction.reply({ embeds: [embedReply] });
	}

	public offLoop(interaction: Command.ChatInputInteraction, erelaPlayer: Player, embedReply: MessageEmbed) {
		if (!interaction.guild) return;
		if (!interaction.member) return;
		if (!interaction.guild.me) return;
		if (!interaction.channel) return;

		if (erelaPlayer.trackRepeat) {
			erelaPlayer.setTrackRepeat(false);
		}

		if (erelaPlayer.queueRepeat) {
			erelaPlayer.setQueueRepeat(false);
		}

		embedReply.setDescription('Looping is now **disabled**.');
		return interaction.reply({ embeds: [embedReply] });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addSubcommand((command) => command.setName('track').setDescription('Loops the currently playing track.'))
					.addSubcommand((command) => command.setName('queue').setDescription('Loops the whole queue.'))
					.addSubcommand((command) => command.setName('off').setDescription('Turns off looping.'))
			//.addStringOption((option) => option.setName('loopmode').setDescription('The loop mode that you want to enable.').setRequired(false))
		);
	}
}
