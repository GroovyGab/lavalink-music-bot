import '../lib/setup';
import { SapphireClient, LogLevel } from '@sapphire/framework';
import { LavalinkHandler } from './Music/LavalinkHandler';
import { Client as StatcordClient } from 'statcord.js';

export class MusicBotClient extends SapphireClient {
	constructor() {
		super({
			defaultPrefix: process.env.PREFIX,
			caseInsensitiveCommands: true,
			logger: {
				level: LogLevel.Debug
			},
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

		this.validate();
		this.manager = new LavalinkHandler(this);
<<<<<<< HEAD
		this.statcord = new StatcordClient({
			key: process.env['STATCORD_KEY']!,
			client: this,
			postCpuStatistics: true,
			postMemStatistics: true,
			postNetworkStatistics: true
=======

		process.on('SIGINT', () => {
			this.destroy();
			process.exit(0);
>>>>>>> ad0acc02d2a4d4d42f5156fdfdc70ee48ec89fcc
		});
	}

	public async main() {
		try {
			this.logger.info('Logging in...');
			await this.login();
			this.logger.info('Logged in!');
		} catch (error) {
			this.logger.fatal(error);
			this.destroy();
			process.exit(1);
		}
	}

	public sleep(ms: number) {
		return new Promise((res) => setTimeout(res, ms));
	}

	private validate() {
		if (!process.env.DISCORD_TOKEN) {
			throw new Error('A Valid Discord bot token must be provided!');
		}

		if (!process.env.PREFIX) {
			throw new Error('A prefix for the bot must be provided!');
		}

		if (!process.env.OWNERS) {
			throw new Error('A owner/s ID must be specified!');
		}

		if (!process.env.LAVALINK_HOST) {
			throw new Error("A Lavalink node's host must be specified!");
		}

		if (!process.env.LAVALINK_PORT) {
			throw new Error("A Lavalink node's port must be specified!");
		}

		if (!process.env.LAVALINK_PASSWD) {
			throw new Error("A Lavalink node's password must be specified!");
		}
	}
}
