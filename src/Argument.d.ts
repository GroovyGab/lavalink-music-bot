import type { LavalinkHandler } from './structures/Music/LavalinkHandler';
import type { Queue } from './structures/Music/Queue';

declare module 'discord.js' {
	interface Client {
		lavalink: LavalinkHandler;
		queue: Queue;
	}
}

import type { SlashCommandStore } from './structures/SlashCommands/SlashCommandStore';

declare module '@sapphire/framework' {
	interface StoreRegistryEntries {
		slashCommands: SlashCommandStore;
	}
}
