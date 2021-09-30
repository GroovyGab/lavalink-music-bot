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

	async handle(
		guild: Guild,
		member: GuildMember,
		channel: TextBasedChannels,
		node: ShoukakuSocket,
		track: ShoukakuTrack
	): Promise<void | Dispatcher> {
		let $DISPATCHER = this.get(guild.id);

		if (!$DISPATCHER) {
			const $PLAYER = await node.joinChannel({
				guildId: guild.id,
				shardId: guild.shardId,
				channelId: member.voice.channelId!
			});
			this.client.logger.debug($PLAYER.constructor.name, `New connection at guild ${guild.name}[${guild.id}]`);
			$DISPATCHER = new Dispatcher({
				client: this.client,
				guild,
				channel,
				player: $PLAYER
			});
			$DISPATCHER.queue.push(track);
			this.set(guild.id, $DISPATCHER);
			this.client.logger.debug(`${$DISPATCHER.constructor.name}: New player dispatcher at guild ${guild.name}[${guild.id}]`);
			return $DISPATCHER;
		}

		$DISPATCHER.queue.push(track);
	}
}
