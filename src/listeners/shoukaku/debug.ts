import type { SapphireClient } from '@sapphire/framework';

export default {
	name: 'debug',
	once: false,
	execute(client: SapphireClient, name: string, reason: string) {
		client.logger.debug(`[Lavalink] Node: ${name}`, reason || 'No reason');
	}
};
