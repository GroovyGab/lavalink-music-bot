import type { ListenerOptions, PieceContext } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';
import type { /* MessageEmbed,*/ VoiceState } from 'discord.js';

export class UserEvent extends Listener<typeof Events.VoiceStateUpdate> {
	public constructor(context: PieceContext, options?: ListenerOptions) {
		super(context, {
			...options,
			event: Events.VoiceStateUpdate
		});
	}

	public run(_oldState: VoiceState, _newState: VoiceState) {
		/**
		 * @todo Auto disconnect system
		 */
	}
}
