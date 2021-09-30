/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message /*, MessageEmbed*/, MessageEmbed } from 'discord.js';
import type Dispatcher from '../../modules/Dispatcher';

@ApplyOptions<CommandOptions>({
	name: 'seek',
	description: 'Rewinds the player by your specified amount.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async run(message: Message, args: Args) {
		const $HH_MM_SS_REGEX = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/g;
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
			 * [1] Parse the user input to an array of numbers.
			 */
			const $TIME_ARRAY = $USER_INPUT.split(':').map((value) => {
				return parseInt(value, 10);
			});

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
				$EMBED_REPLY.setDescription('You need to be in the same voice channel as the bot before you can use this command!.').setColor('RED');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			if (!$HH_MM_SS_REGEX.test($USER_INPUT)) {
				$EMBED_REPLY.setDescription('Invalid time format!, usage: `%seek hh:mm:ss`, `%seek mm:ss`, `%seek ss`');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			let $SEEK_SECONDS: number;

			switch ($TIME_ARRAY.length) {
				case 3: {
					$SEEK_SECONDS = $TIME_ARRAY[0] * 3600 + $TIME_ARRAY[1] * 60 + +$TIME_ARRAY[2]; // converting
					break;
				}
				case 2: {
					$SEEK_SECONDS = $TIME_ARRAY[0] * 60 + +$TIME_ARRAY[1]; // converting
					break;
				}
				case 1: {
					$SEEK_SECONDS = $TIME_ARRAY[0];
				}
			}

			if ($SEEK_SECONDS! > $DISPATCHER.current?.info.length! / 1000) {
				$EMBED_REPLY.setDescription("The specified time is longer that the current track's length!").setColor('RED');
				return message.channel.send({ embeds: [$EMBED_REPLY] });
			}

			$DISPATCHER.player.seekTo($SEEK_SECONDS! * 1000);
			return message.react('👌');
		} catch (error: any) {
			if (error.identifier === 'argsMissing') {
				$EMBED_REPLY.setDescription('You must specify the ammount of time to seek!');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}
			/**
			 * [1] Error handling.
			 */
			this.container.client.logger.error(`There was an unexpected error in command ${this.name}`, error);
			$EMBED_REPLY.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [$EMBED_REPLY] });
		}

		/*if ($HH_MM_SS_REGEX.test($USER_INPUT)) {
			let $SEEK_SECONDS: number;
			switch ($TIME_ARRAY.length) {
				case 3: {
					$SEEK_SECONDS = $TIME_ARRAY[0] * 3600 + $TIME_ARRAY[1] * 60 + +$TIME_ARRAY[2]; // converting
					break;
				}
				case 2: {
					$SEEK_SECONDS = $TIME_ARRAY[0] * 60 + +$TIME_ARRAY[1]; // converting
					break;
				}
				case 1: {
					$SEEK_SECONDS = $TIME_ARRAY[0];
				}
			}

			if ($DISPATCHER) {
				if ($SEEK_SECONDS! > $DISPATCHER.current?.info.length! / 1000) {
					return message.channel.send('testing.errors.invalidLength');
				} else {
					$DISPATCHER.player.seekTo($SEEK_SECONDS! * 1000);
					return message.react('👌');
				}
			} else {
				return await message.reply('testing.errors.noTrackPlaying');
			}
		} else {
			return message.channel.send('testing.errors.invalidTimeFormat');
		}

		/*const dispatcher: Dispatcher = await this.container.client.queue.get(message.guild?.id);
         try {
             if (dispatcher) {
             } else {
                 return await message.reply('testing.errors.noTrackPlaying');
             }
         } catch (error) {
             if (dispatcher) {
                 dispatcher.destroy(error);
             }
 
             this.container.client.logger.error(error);
             return await message.reply('testing.errors.unknownError');
         }*/
	}
}
