import { container, Listener } from '@sapphire/framework';
import type { Player, Track } from 'erela.js';

export class NodeReconnectEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.client.manager,
			event: 'trackEnd'
		});
	}

	public run(player: Player, track: Track) {
		const guild = this.container.client.guilds.cache.get(player.guild);

		this.container.logger.info(
			`Track "${track.title}" by "${track.author}" ended in guild ${guild?.name}[${guild?.id}], Requester: ${track.requester}`
		);

	}
}
