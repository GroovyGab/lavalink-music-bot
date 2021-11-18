import { MessageEmbed } from 'discord.js';
import { Manager } from 'erela.js';
import type { MusicBotClient } from '../Client';
import ErelaSpotify from 'erela.js-spotify';
//import { table } from 'table';

export class LavalinkHandler extends Manager {
	embedReply: MessageEmbed;
	constructor(client: MusicBotClient) {
		super({
			nodes: [
				{
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
			send: (id, payload) => {
				const guild = client.guilds.cache.get(id);
				if (guild) guild.shard.send(payload);
			}
		});

		this.embedReply = new MessageEmbed();

		this.on('nodeConnect', (node) => {
			/*const statsData = [
				['CPU', 'System Load', 'Lavalink Load', 'CPU Cores'],
				['', `${node.stats.cpu.systemLoad}%`, `${node.stats.cpu.lavalinkLoad}%`, node.stats.cpu.cores]
			];
			console.log(table(statsData));*/
			client.logger.info(`[Lavalink] Node "${node.options.identifier}" is now connected.`);
		})
			.on('nodeCreate', (node) => client.logger.info(`[Lavalink] Node "${node.options.identifier} was created.`))
			.on('nodeError', (node, error) => client.logger.error(`[Lavalink] Node ${node.options.identifier} had an error: `, error))
			.on('nodeDestroy', (node) => client.logger.error(`[Lavalink] Node "${node.options.identifier} was destroyed." `))
			.on('nodeReconnect', (node) => client.logger.info(`[Lavalink] Node "${node.options.identifier} is reconnecting.`))
			.on('nodeDisconnect', (node, reason) =>
				client.logger.warn(
					`Node "${node.options.identifier}" was disconnected, Reason: ${reason ? `${reason.reason}, Code: ${reason.code}` : 'No reason.'}`
				)
			)
			.on('playerCreate', (player) => {
				const guild = client.guilds.cache.get(player.guild);
				client.logger.info(`A new player was created in guild ${guild?.name}[${guild?.id}]`);
				client.players.set(guild?.id!, player);
			})
			.on('playerDestroy', (player) => {
				const guild = client.guilds.cache.get(player.guild);
				client.logger.info(`Player was destroyed in guild ${guild?.name}[${guild?.id}]`);
				client.players.delete(guild?.id!);
			})
			.on('queueEnd', (player) => {
				if (!player.textChannel) return;

				this.embedReply.setDescription('Queue has ended, feel free to add more songs using `%play`.');

				const guild = client.guilds.cache.get(player.guild);
				const channel = client.channels.cache.get(player.textChannel);

				if (!channel?.isText()) return;

				client.logger.info(`Queue ended in guild ${guild?.name}[${guild?.id}]`);
				channel.send({ embeds: [this.embedReply] });
			})
			.on('playerMove', async (player, _initCHannel, newChannel) => {
				const guild = client.guilds.cache.get(player.guild);

				if (!newChannel) {
					client.logger.info(`Player was disconnected from voice channel in guild ${guild?.name}[${guild?.id}]`);
					player.destroy();
				} else {
					player.setVoiceChannel(newChannel);
					player.pause(true);
					await client.sleep(1000);
					player.pause(false);
					client.logger.info(
						`Player was moved from voice channel "${_initCHannel}" to "${newChannel}" in guild ${guild?.name}[${guild?.id}]`
					);
				}
			})
			.on('trackStart', (player, track) => {
				const guild = client.guilds.cache.get(player.guild);

				client.logger.info(
					`Track "${track.title}" by "${track.author}" started playing in guild ${guild?.name}[${guild?.id}], Requester: ${track.requester}`
				);
			})
			.on('trackEnd', (player, track) => {
				const guild = client.guilds.cache.get(player.guild);

				client.logger.info(
					`Track "${track.title}" by "${track.author}" ended in guild ${guild?.name}[${guild?.id}], Requester: ${track.requester}`
				);
			})
			.on('trackStuck', (player, track) => {
				const guild = client.guilds.cache.get(player.guild);
				const channel = client.channels.cache.get(player.textChannel!);

				client.logger.warn(
					`Track "${track.title}" by "${track.author}" got stuck during playback in guild ${guild?.name}[${guild?.id}], Skipping...`
				);

				if (!channel?.isText()) return;

				this.embedReply
					.setDescription(`Track "${track.title}" requested by [${track.requester}] got stuck during playback, Skipping...`)
					.setColor('RED');

				channel.send({ embeds: [this.embedReply] });

				player.stop();
			})
			.on('trackError', (player, track) => {
				const guild = client.guilds.cache.get(player.guild);
				const channel = client.channels.cache.get(player.textChannel!);

				client.logger.error(`Track "${track.title}" by "${track.author}" had an error during playback in guild ${guild?.name}[${guild?.id}]`);

				if (!channel?.isText()) return;

				this.embedReply
					.setDescription(`Track "${track.title}" requested by [${track.requester}] had an error during playback, Skipping...`)
					.setColor('RED');

				channel.send({ embeds: [this.embedReply] });

				player.stop();
			})
			.on('socketClosed', (player) => {
				const guild = client.guilds.cache.get(player.guild);

				client.logger.info(`The player's voice connection in guild ${guild?.name}[${guild?.id}] was updated.`);
			});
		/*.on('nodeRaw', console.log);*/ //This is for debugging.
	}
}