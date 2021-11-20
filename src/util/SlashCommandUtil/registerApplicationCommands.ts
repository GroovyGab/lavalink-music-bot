import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { clientId, token } from './config.json';
import * as fs from 'fs';

const registerSlashCommands = (_global: boolean, guildId: string) => {
	const commandFiles = fs
		.readdirSync('../slashCommandBuilders')
		.filter((file) => file.endsWith('.js'));
	const commands = [];

	for (const file of commandFiles) {
		const command = require(`../slashCommandBuilders/${file}`);
		commands.push(command.slashCommand);
	}

	const rest = new REST({ version: '9' }).setToken(token);

	rest.put(Routes.applicationGuildCommands(clientId, guildId), {
		body: commands
	})
		.then(() =>
			console.log('Successfully registered application (/) commands.')
		)
		.catch(console.error);
};

export { registerSlashCommands };
