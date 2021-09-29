/**
 * Module imports.
 */
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import type { ShoukakuSocket } from 'shoukaku';
import { URL } from 'url';
//import SpotifyUri from 'spotify-uri';

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
	public async run(message: Message, args: Args) {
		/**
		 * [1] Get the guild's dispatcher.
		 * [2] Define the embed reply;
		 * [3] Get the user's voice channel.
		 * [4] Get the bot's voice channel.
		 * [5] Get a Lavalink node.
		 */
		const $DISPATCHER = this.container.client.queue.get(message.guild?.id!);
		const $EMBED_REPLY = new MessageEmbed();
		const { channel: $USER_CHANNEL } = message.member?.voice!;
		const { channel: $BOT_CHANNEL } = message.guild?.me?.voice!;
		const $LAVALINK_NODE = this.container.client.shoukaku.getNode();

		try {
			/**
			 * [1] Parse args into a single string.
			 */
			const $SEARCH = await args.rest('string');

			/**
			 * [1] Check if the user is in a voice channel.
			 */
			if (!$USER_CHANNEL) {
				$EMBED_REPLY.setDescription('You have to be connected to a voice channel before you can use this command!').setColor('RED');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			/**
			 * [1] Check if the user is in the same channel as the bot if there's an active queue.
			 */
			if ($DISPATCHER && $USER_CHANNEL!.id !== $BOT_CHANNEL!.id) {
				$EMBED_REPLY.setDescription('You need to be in the same voice channel as the bot before you can use this command!').setColor('RED');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			/**
			 * [1] Check if the bot has the right permissions.
			 */
			const $BOT_PERMISSIONS = $USER_CHANNEL.permissionsFor(message.guild?.me!);

			if (!$BOT_PERMISSIONS.has('CONNECT')) {
				$EMBED_REPLY.setDescription('The "Connect" permission is needed in order to play music in the voice channel.').setColor('RED');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			if (!$BOT_PERMISSIONS.has('SPEAK')) {
				$EMBED_REPLY.setDescription('The "Speak" permission is needed in order to play music in the voice channel.').setColor('RED');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			/**
			 * [1] Pattern checks.
			 */
			const $SPOTIFY_TRACK_URL_REGEX = /(?:https?:\/\/)?(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/;
			const $SPOTIFY_PLAYLIST_URL_REGEX =
				/(?:https?:\/\/)?(?:embed\.|open\.)(?:spotify\.com\/)(?:playlist\/|\?uri=spotify:playlist:)((\w|-){22})/;

			const $SPOTIFY_ALBUM_URL_REGEX = /(?:https?:\/\/)?(?:embed\.|open\.)(?:spotify\.com\/)(?:album\/|\?uri=spotify:playlist:)((\w|-){22})/;

			if ($SPOTIFY_TRACK_URL_REGEX.test($SEARCH)) {
				const $TRACK_ID = $SPOTIFY_TRACK_URL_REGEX.exec($SEARCH)![1];
				const $VIDEO_RESULT = await this.getSpotifyTrackSource($TRACK_ID, $LAVALINK_NODE);

				if (!$VIDEO_RESULT) {
					$EMBED_REPLY.setDescription("Couldn't resolve that URL to a track.").setColor('RED');
					return message.channel.send({ embeds: [$EMBED_REPLY] });
				}

				const { type: $TYPE, tracks: $TRACKS, playlistName: _$PLAYLIST_NAME } = $VIDEO_RESULT;
				const $TRACK = $TRACKS.shift();
				const $PLAYLIST = $TYPE === 'PLAYLIST';
				const $GUILD_DISPATCHER = await this.container.client.queue.handle(
					message.guild!,
					message.member!,
					message.channel,
					$LAVALINK_NODE,
					$TRACK!
				);
				if ($PLAYLIST) {
					for (const $TRACK of $TRACKS)
						await this.container.client.queue.handle(message.guild!, message.member!, message.channel, $LAVALINK_NODE, $TRACK);
				}
				$EMBED_REPLY.setDescription(
					$PLAYLIST
						? `Queued [${$TRACKS[0].info.title}](${$TRACKS[0].info.uri}) and ${$TRACKS.length} other tracks [${message.author}]`
						: `Queued [${$TRACK!.info.title}](${$TRACK!.info.uri}) [${message.author}]`
				);
				$GUILD_DISPATCHER?.play();

				if ($USER_CHANNEL.type === 'GUILD_STAGE_VOICE') {
					this.becomeStageSpeaker(message, $BOT_PERMISSIONS);
				}

				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			if ($SPOTIFY_PLAYLIST_URL_REGEX.test($SEARCH)) {
				$EMBED_REPLY.setDescription('Support for playlists and albums is in development.').setColor('RED');
				return message.channel.send({ embeds: [$EMBED_REPLY] });
			}

			if ($SPOTIFY_ALBUM_URL_REGEX.test($SEARCH)) {
				$EMBED_REPLY.setDescription('Support for playlists and albums is in development.').setColor('RED');
				return message.channel.send({ embeds: [$EMBED_REPLY] });
			}

			/**
			 * Handle whatever other url.
			 */
			if (this.checkURL($SEARCH)) {
				const $VIDEO_RESULT = await $LAVALINK_NODE.rest.resolve($SEARCH);

				if (!$VIDEO_RESULT) {
					$EMBED_REPLY.setDescription("Couldn't resolve the given URL to a track.").setColor('RED');
					return message.reply({ embeds: [$EMBED_REPLY] });
				}

				const { type: $TYPE, tracks: $TRACKS, playlistName: _$PLAYLIST_NAME } = $VIDEO_RESULT;
				const $TRACK = $TRACKS.shift();
				const $PLAYLIST = $TYPE === 'PLAYLIST';
				const $GUILD_DISPATCHER = await this.container.client.queue.handle(
					message.guild!,
					message.member!,
					message.channel,
					$LAVALINK_NODE,
					$TRACK!
				);
				if ($PLAYLIST) {
					for (const $TRACK of $TRACKS)
						await this.container.client.queue.handle(message.guild!, message.member!, message.channel, $LAVALINK_NODE, $TRACK);
				}
				$EMBED_REPLY.setDescription(
					$PLAYLIST
						? `Queued [${$TRACKS[0].info.title}](${$TRACKS[0].info.uri}) and ${$TRACKS.length} other tracks [${message.author}]`
						: `Queued [${$TRACK!.info.title}](${$TRACK!.info.uri}) [${message.author}]`
				);
				$GUILD_DISPATCHER?.play();

				if ($USER_CHANNEL.type === 'GUILD_STAGE_VOICE') {
					this.becomeStageSpeaker(message, $BOT_PERMISSIONS);
				}

				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			/**
			 * If there is no url given, search the user query
			 */
			const $VIDEO_RESULT = await $LAVALINK_NODE.rest.resolve($SEARCH, 'youtube');

			if (!$VIDEO_RESULT) {
				$EMBED_REPLY.setDescription("Couldn't find a result for the given search term.").setColor('RED');
				return message.reply({ embeds: [$EMBED_REPLY] });
			}

			const { type: $TYPE, tracks: $TRACKS, playlistName: _$PLAYLIST_NAME } = $VIDEO_RESULT;
			const $TRACK = $TRACKS.shift();
			const $PLAYLIST = $TYPE === 'PLAYLIST';
			const $GUILD_DISPATCHER = await this.container.client.queue.handle(
				message.guild!,
				message.member!,
				message.channel,
				$LAVALINK_NODE,
				$TRACK!
			);
			if ($PLAYLIST) {
				for (const $TRACK of $TRACKS)
					await this.container.client.queue.handle(message.guild!, message.member!, message.channel, $LAVALINK_NODE, $TRACK);
			}
			$EMBED_REPLY.setDescription(
				$PLAYLIST
					? `Queued [${$TRACKS[0].info.title}](${$TRACKS[0].info.uri}) and ${$TRACKS.length} other tracks [${message.author}]`
					: `Queued [${$TRACK!.info.title}](${$TRACK!.info.uri}) [${message.author}]`
			);
			$GUILD_DISPATCHER?.play();

			if ($USER_CHANNEL.type === 'GUILD_STAGE_VOICE') {
				this.becomeStageSpeaker(message, $BOT_PERMISSIONS);
			}

			return message.reply({ embeds: [$EMBED_REPLY] });
		} catch (error: any) {
			if (error.identifier === 'argsMissing') {
				$EMBED_REPLY.setDescription('You must specify a search term!').setColor('RED');
				return await message.reply({ embeds: [$EMBED_REPLY] });
			}

			/**
			 * [1] Handle whatever other error.
			 */
			this.container.client.logger.error(`There was an unexpected error in command ${this.name}`, error);
			$EMBED_REPLY.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.reply({ embeds: [$EMBED_REPLY] });
		}
	}

	private checkURL(url: string) {
		try {
			new URL(url);
			return true;
		} catch (error) {
			return false;
		}
	}

	private async getSpotifyTrackSource(trackId: string, node: ShoukakuSocket) {
		try {
			const $SPOTIFY_TRACK = await this.container.client.spotify.getTrack(trackId);
			const $SEARCH = `${$SPOTIFY_TRACK.body.name} - ${$SPOTIFY_TRACK.body.artists[0].name}`;
			const $VIDEO_RESULT = await node.rest.resolve($SEARCH, 'youtube');

			return $VIDEO_RESULT;
		} catch (error: any) {
			if (error.statusCode === 404) {
				return null;
			}
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
