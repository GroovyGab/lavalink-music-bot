import { container, Listener } from '@sapphire/framework';
import type { Player } from 'erela.js';

export class NodeReconnectEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.client.manager,
			event: 'playerDestroy'
		});
	}

	public run(player: Player) {
		const guild = this.container.client.guilds.cache.get(player.guild);
		this.container.logger.info(`Player was destroyed in guild ${guild?.name}[${guild?.id}]`);
	}
}
