import { container, Listener } from '@sapphire/framework';
import type { Node } from 'erela.js';

export class NodeDisconnectEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.client.manager,
			event: 'nodeDisconnect'
		});
	}

	public run(node: Node, reason: any) {
		const reasonText = reason ? `${reason.reason}, Code: ${reason.code}` : 'No reason.';
		this.container.logger.warn(`Node "${node.options.identifier}" was disconnected, Reason: ${reasonText}`);
	}
}
