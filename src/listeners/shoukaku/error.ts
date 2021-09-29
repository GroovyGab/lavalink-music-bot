import type { SapphireClient } from '@sapphire/framework';

export default {
	name: 'error',
	once: false,
	execute(client: SapphireClient, name: string, error: Error) {
		client.logger.error(`[Lavalink] Node: "${name}" had an error: ${error}`);
	}
};
