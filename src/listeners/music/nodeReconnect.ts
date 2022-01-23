import { container, Listener } from '@sapphire/framework';
import type { Node } from 'erela.js';

export class NodeReconnectEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.client.manager,
			event: 'nodeReconnect'
		});
	}

	public run(node: Node) {
		this.container.logger.info(`[Lavalink] Node "${node.options.identifier} is reconnecting.`);
	}
}
