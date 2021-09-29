import type { ListenerOptions, PieceContext } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';

export class UserEvent extends Listener<typeof Events.CommandError> {
	public constructor(context: PieceContext, options?: ListenerOptions) {
		super(context, {
			...options,
			event: Events.CommandError
		});
	}

	public run(..._args: any[]) {
		return;
	}
}
