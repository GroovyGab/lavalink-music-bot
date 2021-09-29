import type { ListenerOptions, PieceContext } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';
import { gray } from 'colorette';

export class UserEvent extends Listener<typeof Events.Debug> {
	public constructor(context: PieceContext, options?: ListenerOptions) {
		super(context, {
			...options,
			event: Events.Debug
		});
	}

	public run(message: string) {
		this.container.client.logger.debug(gray(message));
	}
}
