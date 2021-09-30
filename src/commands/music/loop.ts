/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import type Dispatcher from '../../modules/Dispatcher';

/**
 * Command options.
 */
@ApplyOptions<CommandOptions>({
	name: 'loop',
	aliases: ['repeat'],
	description: 'Starts looping your currently playing track or the whole queue.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	/**
	 * The main command method.
	 * @returns
	 */
	public async run(message: Message, args: Args) {
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
			 * [1] Parse user input onto a single string.
			 */
			const $USER_INPUT = await args.rest('string');

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
			 * [1] Handle loop modes.
			 */
			switch ($USER_INPUT) {
				case 'track':
				case 'current': {
					$DISPATCHER.repeat = 'one';
					$EMBED_REPLY.setDescription('Now looping the **current track**.').setColor('GREEN');
					break;
				}
				case 'all':
				case 'queue': {
					$DISPATCHER.repeat = 'all';
					$EMBED_REPLY.setDescription('Now looping the **queue**.').setColor('YELLOW');
					break;
				}
				case 'disable':
				case 'off': {
					$DISPATCHER.repeat = 'off';
					$EMBED_REPLY.setDescription('Looping is now **disabled**.').setColor('RED');
					break;
				}
				default: {
					$EMBED_REPLY.setDescription('Invalid loop mode, the valid modes are: `current` `queue` `off`.').setColor('RED');
				}
			}

			return message.reply({ embeds: [$EMBED_REPLY] });
		} catch (error: any) {
			/**
			 * [1] If the user doesn't provide a loop mode, cycle between them.
			 */
			if (error.identifier === 'argsMissing') {
				/**
				 * [1] Check if the user is in a voice channel.
				 */
				if (!$USER_CHANNEL) {
					$EMBED_REPLY.setDescription('You have to be connected to a voice channel before you can use this command!').setColor('RED');
					return message.reply({ embeds: [$EMBED_REPLY] });
				}
				/**
				 * [1] Check if the user is in the same channel as the bot.
				 */
				if ($USER_CHANNEL.id !== $BOT_CHANNEL!.id) {
					$EMBED_REPLY
						.setDescription('You need to be in the same voice channel as the bot before you can use this command!.')
						.setColor('RED');
					return message.reply({ embeds: [$EMBED_REPLY] });
				}

				if ($DISPATCHER) {
					switch ($DISPATCHER.repeat) {
						case 'one': {
							$DISPATCHER.repeat = 'all';
							$EMBED_REPLY.setDescription('Now looping the **queue**.').setColor('YELLOW');
							break;
						}
						case 'all': {
							$DISPATCHER.repeat = 'off';
							$EMBED_REPLY.setDescription('Looping is now **disabled**.').setColor('RED');
							break;
						}
						case 'off': {
							$DISPATCHER.repeat = 'one';
							$EMBED_REPLY.setDescription('Now looping the **current track**.').setColor('GREEN');
						}
					}

					return message.reply({ embeds: [$EMBED_REPLY] });
				} else {
					$EMBED_REPLY.setDescription("There's no active queue on this server.").setColor('RED');
					return message.reply({ embeds: [$EMBED_REPLY] });
				}
			}

			/**
			 * [1] Handle whatever other error.
			 */
			this.container.client.logger.error(`There was an unexpected error in command ${this.name}"`, error);
			$EMBED_REPLY.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [$EMBED_REPLY] });
		}
	}
}
