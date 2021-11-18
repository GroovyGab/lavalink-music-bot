/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed, Permissions } from 'discord.js';

/**
 * Command options.
 */
@ApplyOptions<CommandOptions>({
	name: 'play',
	aliases: ['p'],
	description: 'Loads your input and adds it to the queue; If there is no playing track, then it will start playing.',
	fullCategory: ['music']
})
export class UserCommand extends Command {
	/**
	 * The main command method.
	 * @returns
	 */
	public async messageRun(message: Message, args: Args) {
		if (!message.guild) return;

		let erelaPLayer = this.container.client.players.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const { channel: userVoiceChannel } = message.member?.voice!;
		const { channel: botVoiceChannel } = message.guild.me?.voice!;

		try {
			const search = await args.rest('string');

			if (!userVoiceChannel) {
				embedReply.setDescription('You have to be connected to a voice channel before you can use this command!').setColor('RED');
				return message.reply({ embeds: [embedReply] });
			}

			if (erelaPLayer && userVoiceChannel.id !== botVoiceChannel?.id) {
				embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!').setColor('RED');
				return message.reply({ embeds: [embedReply] });
			}

			const userVCBotPermissions = userVoiceChannel.permissionsFor(message.guild.me!);

			if (!userVCBotPermissions.has('CONNECT')) {
				embedReply.setDescription('The "Connect" permission is needed in order to play music in the voice channel!').setColor('RED');
				return message.reply({ embeds: [embedReply] });
			}

			if (!userVCBotPermissions.has('SPEAK')) {
				embedReply.setDescription('The "Speak" permission is needed in order to play music in the voice channel!').setColor('RED');
				return message.reply({ embeds: [embedReply] });
			}

			const result = await this.container.client.manager.search(search, message.author);

			if (result.loadType === 'NO_MATCHES') {
				embedReply.setDescription("Couldn't find a result for the given search term!").setColor('RED');
				return message.reply({ embeds: [embedReply] });
			}

			if (result.loadType === 'LOAD_FAILED') {
				embedReply.setDescription(result.exception?.message ? result.exception?.message : 'Failed to load that track!').setColor('RED');
				return message.reply({ embeds: [embedReply] });
			}

			if (result.loadType === 'PLAYLIST_LOADED' && result.playlist && result.playlist?.duration <= 0) {
				embedReply.setDescription("That playlist's duration is too small!").setColor('RED');
				return message.reply({ embeds: [embedReply] });
			}

			if (!erelaPLayer) {
				erelaPLayer = this.container.client.manager.create({
					guild: message.guild.id,
					voiceChannel: message.member!.voice.channel!.id,
					textChannel: message.channel.id,
					volume: 5
				});
			}

			erelaPLayer.connect();
			erelaPLayer.textChannel = message.channel.id;

			if (userVoiceChannel.type === 'GUILD_STAGE_VOICE') {
				this.becomeStageSpeaker(message, userVCBotPermissions);
			}

			erelaPLayer.queue.add(result.tracks[0]);

			if (!erelaPLayer.playing && !erelaPLayer.paused && !erelaPLayer.queue.size) erelaPLayer.play();

			if (!erelaPLayer.playing && !erelaPLayer.paused && erelaPLayer.queue.totalSize === result.tracks.length) erelaPLayer.play();

			embedReply.setDescription(
				result.loadType === 'PLAYLIST_LOADED'
					? `Queued [${result.tracks[0].title}](${result.tracks[0].uri}) and ${
							result.tracks.length - 1 <= 0 ? '**no**' : `**${result.tracks.length - 1}**`
					  } other tracks [${result.tracks[0].requester}]`
					: `Queued [${result.tracks[0].title}](${result.tracks[0].uri}) [${result.tracks[0].requester}]`
			);
			return message.reply({ embeds: [embedReply] });
		} catch (error: any) {
			if (error.identifier === 'argsMissing') {
				embedReply.setDescription('You must specify a search term!').setColor('RED');
				return message.reply({ embeds: [embedReply] });
			}

			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [embedReply] });
		}
	}

	private becomeStageSpeaker(message: Message, bot_permissions: Readonly<Permissions>) {
		const $EMBED_REPLY = new MessageEmbed();

		if (!bot_permissions.has('MANAGE_CHANNELS') || !bot_permissions.has('MUTE_MEMBERS') || !bot_permissions.has('MOVE_MEMBERS')) {
			$EMBED_REPLY
				.setDescription(
					"The voice channel is a stage and the bot doesn't have the permissions:\n**Manage Channels**, **Mute Members** or **Move Members**,\nThese are needed in order to become a stage speaker automatically."
				)
				.setColor('RED');
			return message.channel.send({ embeds: [$EMBED_REPLY] });
		}

		return message.guild?.me?.voice.setSuppressed(false);
	}
}
