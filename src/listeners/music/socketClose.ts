import { container, Listener } from '@sapphire/framework';
import type { Player } from 'erela.js';

export class NodeReconnectEvent extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            emitter: container.client.manager,
            event: 'socketClose'
        });
    }

    public run(player: Player) {
        const guild = this.container.client.guilds.cache.get(player.guild);

        this.container.logger.info(`The player's voice connection in guild ${guild?.name}[${guild?.id}] was updated.`);
    }
}
