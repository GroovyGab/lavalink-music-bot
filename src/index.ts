import { MusicBotClient } from './structures/Client';

const client = new MusicBotClient();

(async () => {
	await client.main();
})();
