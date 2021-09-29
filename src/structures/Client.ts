import '../lib/setup';
import { SapphireClient, LogLevel } from '@sapphire/framework';
import { Shoukaku, Libraries } from 'shoukaku';
import { readdirSync } from 'fs';
import Queue from '../modules/Queue';
import SpotifyAPI from 'spotify-web-api-node';
import { spotifyClientCredentialsGrant } from '../Util';
import node_cron from 'node-cron';

export default class CLient extends SapphireClient {
	public shoukaku: Shoukaku;
	public queue: Queue;
	public spotify: SpotifyAPI;
	constructor() {
		super({
			allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
			defaultPrefix: '%',
			caseInsensitiveCommands: true,
			logger: {
				level: LogLevel.Debug
			},
			api: {},
			shards: 'auto',
			intents: [
				'GUILDS',
				'GUILD_MEMBERS',
				'GUILD_BANS',
				'GUILD_EMOJIS_AND_STICKERS',
				'GUILD_VOICE_STATES',
				'GUILD_MESSAGES',
				'GUILD_MESSAGE_REACTIONS',
				'DIRECT_MESSAGES',
				'DIRECT_MESSAGE_REACTIONS'
			]
		});

		const client = this;
		this.shoukaku = new Shoukaku(
			new Libraries.DiscordJS(client),
			[{ name: 'NODE_1', url: `${process.env.LAVALINK_HOST}:${process.env.LAVALINK_PORT}`, auth: process.env.LAVALINK_PASSWD! }],
			{ resumable: true, resumableTimeout: 30, reconnectTries: 10, moveOnDisconnect: true, restTimeout: 15000, reconnectInterval: 5000 }
		);

		this.spotify = new SpotifyAPI({
			clientId: process.env.SPOTIFY_CLIENT_ID,
			clientSecret: process.env.SPOTIFY_CLIENT_SECRET
		});

		this.queue = new Queue(this);

		/**
		 * [1] Event handler for Shoukaku.
		 */
		const eventFiles = readdirSync(`${__dirname}/../listeners/shoukaku`).filter((file) => file.endsWith('.js'));
		for (const file of eventFiles) {
			const event = require(`${__dirname}/../listeners/shoukaku/${file}`).default;
			if (event.once) {
				this.shoukaku.once(event.name, (...args) => event.execute(client, ...args));
			} else {
				this.shoukaku.on(event.name, (...args) => event.execute(client, ...args));
			}
		}
	}

	public async main(): Promise<void> {
		try {
			this.logger.info('Attempting to Log in...');
			await this.login();
			spotifyClientCredentialsGrant(this);

			node_cron.schedule('*/30 * * * *', () => {
				spotifyClientCredentialsGrant(this);
			});
		} catch (error) {
			this.logger.fatal(error);
			this.destroy();
			process.exit(1);
		}
	}
}

declare module 'discord.js' {
	interface Client {
		shoukaku: Shoukaku;
		queue: Queue;
		spotify: SpotifyAPI;
	}
}
