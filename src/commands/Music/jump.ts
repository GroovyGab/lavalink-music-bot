import { Command } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
//import { MessageEmbed } from 'discord.js';

export class PingCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'jump',
			description: 'Skips to the specified track.',
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
			const jumpTo = parseInt(interaction.options.getString('jumpto')!);

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

			if (isNaN(jumpTo)) {
				embedReply.setDescription('The value of the track to be jumped to must be a number!');
				return interaction.reply({ embeds: [embedReply] });
			}

			if (jumpTo > erelaPlayer.queue.length + 1) {
				embedReply.setDescription("The number of the track to be jumped to can't be larger than que queue's length!");
				return interaction.reply({ embeds: [embedReply] });
			}

			console.log(jumpTo);
			erelaPlayer.stop(jumpTo);

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
					option.setName('jumpto').setDescription("The number of the track in the queue that you'd like to skip to.").setRequired(true)
				)
		);
	}
}
