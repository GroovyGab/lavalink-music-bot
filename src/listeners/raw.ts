import { Listener, PieceContext } from '@sapphire/framework';
import type { VoicePacket } from 'erela.js';

export class CommandInteraction extends Listener {
	constructor(context: PieceContext) {
		super(context);
	}

	async run(d: VoicePacket) {
		this.container.client.manager.updateVoiceState(d);
	}
}
