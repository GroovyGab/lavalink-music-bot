import { Command } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';

export class DisconnectCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'disconnect',
			description: 'Disconnects the bot from your voice channel and clears the queue.',
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

			erelaPlayer.destroy();
			return await interaction.reply('👋');
		} catch (error: any) {
			this.container.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return interaction.reply({ embeds: [embedReply], ephemeral: true });
		}
	}
}
