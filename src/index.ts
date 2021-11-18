import { MusicBotClient } from './structures/Client';

const client = new MusicBotClient();

(async () => {
	await client.main();

	process.on('SIGINT', () => {
		client.destroy();
		process.exit(0);
	});
})();
