import '../lib/setup';
import { SapphireClient, LogLevel } from '@sapphire/framework';
import { LavalinkHandler } from './Music/LavalinkHandler';
//import { Client as StatcordClient } from 'statcord.js';

export class MusicBotClient extends SapphireClient {
	constructor() {
		super({
			defaultPrefix: process.env.PREFIX,
			caseInsensitiveCommands: true,
			logger: {
				level: LogLevel.Debug
			},
			shards: 'auto',
			intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_VOICE_STATES']
		});

		this.manager = new LavalinkHandler(this);

		/*this.statcord = new StatcordClient({
			key: process.env['STATCORD_KEY']!,
			client: this,
			postCpuStatistics: true,
			postMemStatistics: true,
			postNetworkStatistics: true
		});*/
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
