import { container, Listener } from '@sapphire/framework';

export class NodeConnectEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.client.statcord,
			event: 'post'
		});
	}

	public run(status: string | boolean | Error) {
		if (!status) {
			this.container.logger.info('[Statcord] Successful post');
		} else {
			this.container.logger.error('[Statcord] Error', status);
		}
	}
}
