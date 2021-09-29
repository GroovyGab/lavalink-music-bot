import type { SapphireClient } from '@sapphire/framework';
import { Collection, Guild, GuildMember, TextBasedChannels } from 'discord.js';
import type { ShoukakuSocket } from 'shoukaku';
import type { ShoukakuTrack } from 'shoukaku/types/Constants';
import Dispatcher from './Dispatcher';

export default class Queue extends Collection<string, Dispatcher> {
	client: SapphireClient;
	constructor(client: SapphireClient) {
		super();
		this.client = client;
	}

	async handle(guild: Guild, member: GuildMember, channel: TextBasedChannels, node: ShoukakuSocket, track: ShoukakuTrack) {
		const existing = this.get(guild.id);
		if (!existing) {
			const player = await node.joinChannel({
				guildId: guild.id,
				shardId: guild.shardId,
				channelId: member.voice.channelId!
			});
			this.client.logger.debug(player.constructor.name, `New connection at guild ${guild.name}[${guild.id}]`);
			const dispatcher = new Dispatcher({
				client: this.client,
				guild,
				channel,
				player
			});
			dispatcher.queue.push(track);
			this.set(guild.id, dispatcher);
			this.client.logger.debug(dispatcher.constructor.name, `New player dispatcher at guild ${guild.name}[${guild.id}]`);
			return dispatcher;
		}
		existing.queue.push(track);
		return null;
	}
}
