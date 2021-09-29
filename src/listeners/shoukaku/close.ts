import type { SapphireClient } from '@sapphire/framework';

export default {
	name: 'close',
	once: false,
	execute(client: SapphireClient, name: string, code: number, reason: string) {
		client.logger.debug(`[Lavalink] Node: "${name}" closed with code ${code} with the reason:`, reason || 'No reason.');
	}
};
