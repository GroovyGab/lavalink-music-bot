import { Command } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';

export class SpeedCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'speed',
			description: 'Sets the player\'s playback speed; If you input "reset", it will set the speed back to default.',
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

		const embedReply = new MessageEmbed();

		try {
			return interaction.reply(':(');
		} catch (error: any) {
			this.container.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return interaction.reply({ embeds: [embedReply] });
		}
	}
}
