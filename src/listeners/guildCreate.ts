import type { ListenerOptions, PieceContext } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { cyan } from 'colorette';

export class GuildCrateEvent extends Listener<typeof Events.GuildCreate> {
	public constructor(context: PieceContext, options?: ListenerOptions) {
		super(context, {
			...options,
			event: Events.GuildCreate
		});
	}

	public run(guild: Guild) {
		this.container.logger.info(`Client joined new guild ${guild.name}[${cyan(guild.id)}]`);
	}
}
