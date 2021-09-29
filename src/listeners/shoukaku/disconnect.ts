import type { SapphireClient } from '@sapphire/framework';
import type { ShoukakuPlayer } from 'shoukaku';

export default {
	name: 'disconnect',
	once: false,
	execute(client: SapphireClient, name: string, players: ShoukakuPlayer[], moved: boolean) {
		client.logger.debug(
			`[Lavalink] Node: "${name}" disconnected,`,
			moved ? `${players.length} players have been moved.` : `${players.length} players have been disconnected.`
		);
	}
};
