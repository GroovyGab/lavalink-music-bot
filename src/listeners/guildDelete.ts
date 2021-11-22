import type { ListenerOptions, PieceContext } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { cyan } from 'colorette';

export class UserEvent extends Listener<typeof Events.GuildDelete> {
	public constructor(context: PieceContext, options?: ListenerOptions) {
		super(context, {
			...options,
			event: Events.GuildDelete
		});
	}

	public run(guild: Guild) {
		this.container.logger.info(`Client left guild ${guild.name}[${cyan(guild.id)}]`);
	}
}
