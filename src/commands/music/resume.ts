/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
//@ts-ignore
import type Dispatcher from '../../modules/Dispatcher';

/**
 * Command options.
 */
@ApplyOptions<CommandOptions>({
	name: 'resume',
	description: 'Resume your currently playing track.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	/**
	 * The main command method.
	 * @returns
	 */
	public async run(message: Message) {
		/**
		 * [1] Get the guild's dispatcher.
		 * [2] Define the embed reply.
		 * [3] Get the user's voice channel.
		 * [4] Get the bot's voice channel.
		 */
		const $DISPATCHER: Dispatcher = this.container.client.queue.get(message.guild?.id!)!;
		const $EMBED_REPLY = new MessageEmbed();
		const { channel: $USER_CHANNEL } = message.member?.voice!;
		const { channel: $BOT_CHANNEL } = message.guild?.me?.voice!;

		try {
			/**
			 * [1] Check if the user is in a voice channel.
			 */
			if (!$USER_CHANNEL) {
				$EMBED_REPLY.setDescription('You have to be connected to a voice channel before you can use this command!').setColor('RED');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			/**
			 * [1] Check if there's an existing queue.
			 */
			if (!$DISPATCHER) {
				$EMBED_REPLY.setDescription("There's no active queue on this server!").setColor('RED');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			/**
			 * [1] Check if the user is in the same channel as the bot.
			 */
			if ($USER_CHANNEL!.id !== $BOT_CHANNEL!.id) {
				$EMBED_REPLY.setDescription('You need to be in the same voice channel as the bot before you can use this command!').setColor('RED');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			/**
			 * [1] Check if player isn't paused.
			 */
			if (!$DISPATCHER.player.paused) {
				$EMBED_REPLY.setDescription("The playback isn't paused!").setColor('RED');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			$DISPATCHER.player.setPaused(false);
			return message.react('▶️');
		} catch (error: any) {
			/**
			 * [All] Error handling.
			 */
			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error.message);
			$EMBED_REPLY.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [$EMBED_REPLY] });
		}
	}
}
