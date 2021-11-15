import { Listener, PieceContext } from '@sapphire/framework';
import type { Interaction } from 'discord.js';

export class CommandInteraction extends Listener {
	constructor(context: PieceContext) {
		super(context);
	}

	async run(interaction: Interaction) {
		if (!interaction.isCommand()) return;

		const cmd = this.container.stores.get('slashCommands').get(interaction.commandName);
		if (!cmd) return;

		try {
			await cmd.run(interaction);
			this.container.logger.info(`${interaction.user.id} ran slash command ${cmd.commandData.name}`);
		} catch (e: any) {
			this.container.logger.fatal(e);

			if (interaction.replied) {
				return interaction
					.followUp({
						content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\``,
						ephemeral: true
					})
					.catch((e: any) => this.container.logger.fatal('An error occurred following up on an error', e));
			}

			if (interaction.deferred) {
				return interaction
					.editReply({
						content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\``
					})
					.catch((e: any) => console.error('An error occurred following up on an error', e));
			}

			return interaction
				.reply({
					content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\``,
					ephemeral: true
				})
				.catch((e: any) => this.container.logger.fatal('An error occurred replying on an error', e));
		}
	}
}
