import { container, Listener } from '@sapphire/framework';
import type { Node } from 'erela.js';

export class NodeCrateEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.client.manager,
			event: 'nodeCreate'
		});
	}

	public run(node: Node) {
		this.container.logger.info(`[Lavalink] Node "${node.options.identifier} was created.`);
	}
}
