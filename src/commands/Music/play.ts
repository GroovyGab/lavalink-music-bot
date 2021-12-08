import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'play',
	aliases: ['p'],
	description: 'Loads your input and adds it to the queue; If there is no playing track, then it will start playing.',
	fullCategory: ['music']
})
export class PlayCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		if (!message.guild) return;
		if (!message.member) return;
		if (!message.guild.me) return;

		let erelaPlayer = this.container.client.manager.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const warnEmbed = new MessageEmbed();
		const userVoiceChannel = message.member.voice.channel;
		const botVoiceChannel = message.guild.me.voice.channel;

		try {
			const search = await args.rest('string');

			if (!userVoiceChannel) {
				embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
				return await message.channel.send({ embeds: [embedReply] });
			}

			if (erelaPlayer && botVoiceChannel && userVoiceChannel.id !== botVoiceChannel.id) {
				embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!');
				return await message.channel.send({ embeds: [embedReply] });
			}

			const userVCBotPermissions = userVoiceChannel.permissionsFor(message.guild.me);

			if (!userVCBotPermissions.has('CONNECT')) {
				embedReply.setDescription('The "Connect" permission is needed in order to play music in the voice channel!');
				return await message.channel.send({ embeds: [embedReply] });
			}

			if (!userVCBotPermissions.has('SPEAK')) {
				embedReply.setDescription('The "Speak" permission is needed in order to play music in the voice channel!');
				return await message.channel.send({ embeds: [embedReply] });
			}

			const result = await this.container.client.manager.search(search, message.author);

			if (result.loadType === 'NO_MATCHES') {
				embedReply.setDescription("Couldn't find a result for the given search term!");
				return await message.channel.send({ embeds: [embedReply] });
			}

			if (result.loadType === 'LOAD_FAILED') {
				embedReply.setDescription(result.exception?.message ? result.exception?.message : 'Failed to load one or more tracks!');
				return await message.channel.send({ embeds: [embedReply] });
			}

			if (result.loadType === 'PLAYLIST_LOADED' && result.playlist && result.playlist?.duration <= 0) {
				embedReply.setDescription("That playlist's duration is too small!");
				return await message.channel.send({ embeds: [embedReply] });
			}

			if (!erelaPlayer) {
				erelaPlayer = this.container.client.manager.create({
					guild: message.guild.id,
					voiceChannel: message.member.voice.channel.id,
					textChannel: message.channel.id,
					selfDeafen: true,
					volume: 10
				});
				erelaPlayer.connect();

				await this.container.client.sleep(1000);

				if (userVoiceChannel.type === 'GUILD_STAGE_VOICE') {
					const newVoiceChannelPerms = userVoiceChannel.permissionsFor(message.guild.me);

					if (newVoiceChannelPerms.has('MANAGE_CHANNELS') && newVoiceChannelPerms.has('MUTE_MEMBERS') && newVoiceChannelPerms.has('MOVE_MEMBERS')) {
						message.guild.me.voice.setSuppressed(false);
					} else {
						warnEmbed.setDescription("The voice channel is a stage and the bot doesn't have the permissions:\n**Manage Channels**, **Mute Members** or **Move Members**,\nThese are needed in order to become a stage speaker automatically.");
						await message.channel.send({ embeds: [warnEmbed] });
					}
				}
			}

			erelaPlayer.textChannel = message.channel.id;

			if (result.loadType === 'PLAYLIST_LOADED') {
				erelaPlayer.queue.add(result.tracks);

				await this.container.client.sleep(1000);

				if (!erelaPlayer.playing && !erelaPlayer.paused && erelaPlayer.queue.totalSize === result.tracks.length) erelaPlayer.play();

				const playlistLength = `**${result.tracks.length - 1}**`;

				embedReply.setDescription(`Queued [${result.tracks[0].title}](${result.tracks[0].uri}) and ${result.tracks.length - 1 <= 0 ? '**no**' : playlistLength} other tracks [${result.tracks[0].requester}]`);
				return await message.channel.send({ embeds: [embedReply] });
			}

			erelaPlayer.queue.add(result.tracks[0]);
			if (!erelaPlayer.playing && !erelaPlayer.paused && !erelaPlayer.queue.size) erelaPlayer.play();

			embedReply.setDescription(`Queued [${result.tracks[0].title}](${result.tracks[0].uri}) [${result.tracks[0].requester}]`);
			return await message.channel.send({ embeds: [embedReply] });
		} catch (error: any) {
			if (error.identifier === 'argsMissing') {
				embedReply.setDescription('You must specify a search term!');
				return message.channel.send({ embeds: [embedReply] });
			}

			this.container.client.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.channel.send({ embeds: [embedReply] });
		}
	}
}
