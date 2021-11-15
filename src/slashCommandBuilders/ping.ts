import { SlashCommandBuilder } from '@discordjs/builders';

const slashCommand = new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!').toJSON();

export { slashCommand };
