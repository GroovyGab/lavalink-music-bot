import { Manager } from 'erela.js';
import type { MusicBotClient } from '../Client';
import ErelaSpotify from 'erela.js-spotify';
import { Structure } from 'erela.js';

export class LavalinkHandler extends Manager {
	constructor(client: MusicBotClient) {
		super({
			nodes: [
				{
					identifier: 'NODE_1',
					host: process.env.LAVALINK_HOST!,
					port: parseInt(process.env.LAVALINK_PORT!),
					password: process.env.LAVALINK_PASSWD,
					retryDelay: 5000
				}
			],
			plugins: [
				new ErelaSpotify({
					clientID: process.env.SPOTIFY_CLIENT_ID!,
					clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
					convertUnresolved: false
				})
			],
			autoPlay: true,
			clientName: `${process.env.CLIENT_NAME}/${process.env.CLIENT_VERSION}`,
			send: (id, payload) => {
				const guild = client.guilds.cache.get(id);
				if (guild) guild.shard.send(payload);
			}
		});

		Structure.extend(
			'Player',
			(Player) =>
				class extends Player {
					existingLeaveTimeout?: boolean;
				}
		);

		/*this
		.on('nodeRaw', console.log);*/ //This is for debugging.
	}
}
