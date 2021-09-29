import type { SapphireClient } from '@sapphire/framework';

export default {
	name: 'ready',
	once: false,
	execute(client: SapphireClient, name: string, resumed: boolean) {
		client.logger.info(`[Lavalink] Node: "${name}" is now connected,`, `This connection is ${resumed ? 'resumed.' : 'a new connection.'}`);
	}
};
