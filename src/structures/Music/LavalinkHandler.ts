import { MessageEmbed } from 'discord.js';
import { Manager } from 'erela.js';
import type { MusicBotClient } from '../Client';
import ErelaSpotify from 'erela.js-spotify';

export class LavalinkHandler extends Manager {
	embedReply: MessageEmbed;
	client: MusicBotClient;
	constructor(client: MusicBotClient) {
		super({
			nodes: [
				{
					identifier: 'NODE_1',
					host: process.env.LAVALINK_HOST!,
					port: parseInt(process.env.LAVALINK_PORT!),
					password: process.env.LAVALINK_PASSWD,
					retryDelay: 5000
				}
			],
			plugins: [
				new ErelaSpotify({
					clientID: process.env.SPOTIFY_CLIENT_ID!,
					clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
					convertUnresolved: false
				})
			],
			autoPlay: true,
			clientName: `${process.env.CLIENT_NAME}/${process.env.CLIENT_VERSION}`,
			send: (id, payload) => {
				const guild = client.guilds.cache.get(id);
				if (guild) guild.shard.send(payload);
			}
		});

		this.embedReply = new MessageEmbed();
		this.client = client;

		this.on('playerCreate', (player) => {
			const guild = this.client.guilds.cache.get(player.guild);
			this.client.logger.info(`A new player was created in guild ${guild?.name}[${guild?.id}]`);
		})
			.on('nodeCreate', (node) => this.client.logger.info(`[Lavalink] Node "${node.options.identifier} was created.`))
			.on('nodeError', (node, error) => this.client.logger.error(`[Lavalink] Node ${node.options.identifier} had an error: `, error))
			.on('nodeDestroy', (node) => this.client.logger.error(`[Lavalink] Node "${node.options.identifier} was destroyed." `))
			.on('nodeReconnect', (node) => this.client.logger.info(`[Lavalink] Node "${node.options.identifier} is reconnecting.`))
			.on('nodeDisconnect', (node, reason) => {
				const reasonAndCode = `${reason.reason}, Code: ${reason.code}`;
				this.client.logger.warn(`Node "${node.options.identifier}" was disconnected, Reason: ${reason ? reasonAndCode : 'No reason.'}`);
			})
			.on('playerCreate', (player) => {
				const guild = this.client.guilds.cache.get(player.guild);
				this.client.logger.info(`A new player was created in guild ${guild?.name}[${guild?.id}]`);
			})
			.on('playerDestroy', (player) => {
				const guild = this.client.guilds.cache.get(player.guild);
				this.client.logger.info(`Player was destroyed in guild ${guild?.name}[${guild?.id}]`);
			})
			.on('queueEnd', (player) => {
				if (!player.textChannel) return;

				this.embedReply.setDescription(`Queue has ended, feel free to add more songs using  \`${process.env.PREFIX}play\`.`);

				const guild = this.client.guilds.cache.get(player.guild);
				const channel = this.client.channels.cache.get(player.textChannel);

				if (!channel?.isText()) return;

				this.client.logger.info(`Queue ended in guild ${guild?.name}[${guild?.id}]`);
				channel.send({ embeds: [this.embedReply] });
			})
			.on('playerMove', async (player, _initCHannel, newVoiceChannel) => {
				if (!player) return;
				const guild = this.client.guilds.cache.get(player.guild);
				const newChannelFetch = this.client.channels.cache.get(newVoiceChannel);

				if (!newVoiceChannel) {
					this.client.logger.info(`Player was disconnected from voice channel in guild ${guild?.name}[${guild?.id}]`);
					player.destroy();
				} else {
					player.setVoiceChannel(newVoiceChannel);
					player.pause(true);

					await this.client.sleep(1000);

					if (!newChannelFetch || !newChannelFetch.isVoice()) return;

					if (newChannelFetch.type === 'GUILD_STAGE_VOICE') {
						const newVCBotPerms = newChannelFetch.permissionsFor(newChannelFetch.guild.me!);
						if (newVCBotPerms.has('MANAGE_CHANNELS') || newVCBotPerms.has('MUTE_MEMBERS') || newVCBotPerms.has('MOVE_MEMBERS')) {
							newChannelFetch.guild.me!.voice.setSuppressed(false);
						}
					}

					player.pause(false);

					this.client.logger.info(
						`Player was moved from voice channel "${_initCHannel}" to "${newVoiceChannel}" in guild ${guild?.name}[${guild?.id}]`
					);
				}
			})
			.on('trackStart', (player, track) => {
				const guild = this.client.guilds.cache.get(player.guild);

				this.client.logger.info(
					`Track "${track.title}" by "${track.author}" started playing in guild ${guild?.name}[${guild?.id}], Requester: ${track.requester}`
				);
			})
			.on('trackEnd', (player, track) => {
				const guild = this.client.guilds.cache.get(player.guild);

				this.client.logger.info(
					`Track "${track.title}" by "${track.author}" ended in guild ${guild?.name}[${guild?.id}], Requester: ${track.requester}`
				);
			})
			.on('trackStuck', (player, track) => {
				const guild = this.client.guilds.cache.get(player.guild);
				const channel = this.client.channels.cache.get(player.textChannel!);

				this.client.logger.warn(
					`Track "${track.title}" by "${track.author}" got stuck during playback in guild ${guild?.name}[${guild?.id}], Skipping...`
				);

				if (!channel?.isText()) return;

				this.embedReply.setDescription(`Track "${track.title}" requested by [${track.requester}] got stuck during playback, Skipping...`);

				channel.send({ embeds: [this.embedReply] });

				player.stop();
			})
			.on('trackError', (player, track) => {
				const guild = this.client.guilds.cache.get(player.guild);
				const channel = this.client.channels.cache.get(player.textChannel!);

				this.client.logger.error(
					`Track "${track.title}" by "${track.author}" had an error during playback in guild ${guild?.name}[${guild?.id}]`
				);

				if (!channel?.isText()) return;

				this.embedReply.setDescription(`Track "${track.title}" requested by [${track.requester}] had an error during playback, Skipping...`);

				channel.send({ embeds: [this.embedReply] });

				player.stop();
			})
			.on('socketClosed', (player) => {
				const guild = this.client.guilds.cache.get(player.guild);

				this.client.logger.info(`The player's voice connection in guild ${guild?.name}[${guild?.id}] was updated.`);
			});
		/*.on('nodeRaw', console.log);*/ //This is for debugging.
	}
}
