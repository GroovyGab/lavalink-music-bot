import '../lib/setup';
import { SapphireClient, LogLevel } from '@sapphire/framework';
import { LavalinkHandler } from './Music/LavalinkHandler';

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

		this.manager = new LavalinkHandler(this);
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
}
