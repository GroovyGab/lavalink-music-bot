/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import type Dispatcher from '../../modules/Dispatcher';

@ApplyOptions<CommandOptions>({
	name: 'skip',
	description: 'Skips to the next song.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	public async run(message: Message) {
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
				$EMBED_REPLY.setDescription("There's no active queue on this server.").setColor('RED');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			/**
			 * [1] Check if the user is in the same channel as the bot.
			 */
			if ($USER_CHANNEL!.id !== $BOT_CHANNEL!.id) {
				$EMBED_REPLY.setDescription('You need to be in the same voice channel as the bot before you can use this command!.').setColor('RED');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			/**
			 * [1] Check if there's a track playing
			 */
			if (!$DISPATCHER.current) {
				$EMBED_REPLY.setDescription("There's no track currently playing on this guild.").setColor('RED');
				message.reply({ embeds: [$EMBED_REPLY] });
			}

			$DISPATCHER.player.stopTrack();
			$DISPATCHER.player.emit('start');
			return message.react('👌');
		} catch (error) {
			/**
			 * [All] Error handling.
			 */
			this.container.client.logger.error(`There was an unexpected error in command ${this.name}`, error);
			$EMBED_REPLY.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [$EMBED_REPLY] });
		}
		/*try {
			if (dispatcher) {
				dispatcher.player.stopTrack();
				dispatcher.player.emit('start');
				return await message.react('👌');
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
