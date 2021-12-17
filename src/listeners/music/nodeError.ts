import { container, Listener } from '@sapphire/framework';
import type { Node } from 'erela.js';

export class NodeErrorEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.client.manager,
			event: 'nodeError'
		});
	}

	public run(node: Node, error: Error) {
		this.container.logger.error(`[Lavalink] Node ${node.options.identifier} had an error: `, error);
	}
}
