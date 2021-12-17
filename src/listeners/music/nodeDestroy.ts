import { container, Listener } from '@sapphire/framework';
import type { Node } from 'erela.js';

export class NodeDestroyEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.client.manager,
			event: 'nodeDestroy'
		});
	}

	public run(node: Node) {
		this.container.logger.warn(`[Lavalink] Node "${node.options.identifier} was destroyed." `);
	}
}
