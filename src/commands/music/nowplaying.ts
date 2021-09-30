/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import type Dispatcher from '../../modules/Dispatcher';
import { splitBar } from 'string-progressbar';

/**
 * Command options.
 */
@ApplyOptions<CommandOptions>({
	name: 'nowplaying',
	aliases: ['np', 'current'],
	description: 'Shows the currentply playing track.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	/**
	 * The main command method.
	 * @returns
	 */
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
			 * [1] Check if there's a track playing
			 */
			if (!$DISPATCHER.current) {
				$EMBED_REPLY.setDescription("There's no track currently playing on this guild!").setColor('RED');
				message.reply({ embeds: [$EMBED_REPLY] });
			}

			const $STREAM = $DISPATCHER.current?.info.isStream;
			const $POSITION = $DISPATCHER.player.position;
			const $TIME_LEFT = $DISPATCHER.current?.info.length! - $POSITION;
			const $SPLIT_PROGRESS_BAR = $STREAM ? '' : splitBar($DISPATCHER.current?.info.length!, $POSITION, 20)[0];
			const $PROGRESS_TIME = $STREAM ? '' : `**[${new Date(($POSITION / 1000) * 1000).toISOString().substr(11, 8)}]**`;
			const $TOTAL_LENGTH_TIME = $STREAM
				? ''
				: `**[${new Date(($DISPATCHER.current?.info.length! / 1000) * 1000).toISOString().substr(11, 8)}]**`;
			const $REMAINING_TIME = $STREAM ? '' : `Time remaining: ${new Date(($TIME_LEFT / 1000) * 1000).toISOString().substr(11, 8)}`;

			$EMBED_REPLY
				.setTitle('Now playing')
				.setDescription(
					$STREAM
						? `[${$DISPATCHER.current?.info.title}](${$DISPATCHER.current?.info.uri})\n**[◉ LIVE]**`
						: `[${$DISPATCHER.current?.info.title}](${$DISPATCHER.current?.info.uri})\n**[**${$SPLIT_PROGRESS_BAR}**]**\n${$PROGRESS_TIME} **/** ${$TOTAL_LENGTH_TIME}`
				)
				.setFooter($REMAINING_TIME);
			return message.reply({ embeds: [$EMBED_REPLY] });
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
