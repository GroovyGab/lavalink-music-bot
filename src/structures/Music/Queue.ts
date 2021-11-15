import { Collection, Guild, GuildMember, TextBasedChannels } from 'discord.js';
import type { ShoukakuSocket, ShoukakuTrack } from 'shoukaku';
import type { MusicBotClient } from '../Client';
import { LavalinkDispatcher } from './LavalinkDispatcher';

export class Queue extends Collection<string, LavalinkDispatcher> {
	client: MusicBotClient;
	constructor(client: MusicBotClient) {
		super();
		this.client = client;
	}

	async handle(guild: Guild, member: GuildMember, channel: TextBasedChannels, node: ShoukakuSocket, track: ShoukakuTrack) {
		let dispatcher = this.get(guild.id);

		if (!dispatcher) {
			const $PLAYER = await node.joinChannel({
				guildId: guild.id,
				shardId: guild.shardId,
				channelId: member.voice.channelId!
			});
			this.client.logger.debug(`New connection at guild ${guild.name}[${guild.id}]`);
			dispatcher = new LavalinkDispatcher({
				client: this.client,
				guild,
				channel,
				player: $PLAYER
			});
			dispatcher.queue.push(track);
			this.set(guild.id, dispatcher);
			this.client.logger.debug(`New player dispatcher at guild ${guild.name}[${guild.id}]`);
			return dispatcher;
		}

		dispatcher.queue.push(track);
		if (!dispatcher.current) {
			dispatcher.play();
		}
		//dispatcher.play();
		return null;
	}
}
