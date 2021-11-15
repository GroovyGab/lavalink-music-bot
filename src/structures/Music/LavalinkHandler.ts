import { Shoukaku, Libraries } from 'shoukaku';
import type { MusicBotClient } from '../Client';

export class LavalinkHandler extends Shoukaku {
	constructor(client: MusicBotClient) {
		super(
			new Libraries.DiscordJS(client),
			[{ name: 'NODE_1', url: `${process.env.LAVALINK_HOST}:${process.env.LAVALINK_PORT}`, auth: process.env.LAVALINK_PASSWD! }],
			{ resumable: true, resumableTimeout: 30, reconnectTries: 10, moveOnDisconnect: true, restTimeout: 15000, reconnectInterval: 5000 }
		);
		this.on('ready', (name: any, resumed: any) =>
			client.logger.info(
				`[LAVALINK] Node: "${name}" is now connected and this connection is ${resumed ? 'a resumed connection.' : 'a new connection.'}`
			)
		)
			.on('error', (name: any, error: unknown) => client.logger.error(`[LAVALINK] Node: "${name}" had an error: `, error))
			.on('close', (name: any, code: any, reason: any) =>
				client.logger.info(`[LAVALINK] Node: "${name}" closed with code ${code}, Reason: `, reason || 'No reason.')
			)
			.on('disconnect', (name: any, _players: any, moved: any) =>
				client.logger.info(`[LAVALINK] Node: "${name}" disconnected`, moved ? 'players have been moved.' : 'players have been disconnected.')
			)
			.on('debug', (name: any, reason: any) => client.logger.info(`[LAVALINK] Node: "${name}"`, reason || 'No reason.'));
	}
}
