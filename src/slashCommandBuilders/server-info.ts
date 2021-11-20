import { SlashCommandBuilder } from '@discordjs/builders';

const slashCommand = new SlashCommandBuilder()
	.setName('server-info')
	.setDescription('Displays server information.')
	.toJSON();

export { slashCommand };
