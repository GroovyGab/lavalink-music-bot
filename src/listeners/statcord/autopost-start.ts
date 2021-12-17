import { container, Listener } from '@sapphire/framework';

export class NodeConnectEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.client.statcord,
			event: 'autopost-start'
		});
	}

	public run() {
		this.container.logger.info('[Statcord] Started autopost.');
	}
}
