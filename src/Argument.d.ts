import type { Collection } from 'discord.js';
import type { Player } from 'erela.js';
import type { LavalinkHandler } from './structures/Music/LavalinkHandler';
import type { Queue } from './structures/Music/Queue';
import type { SlashCommandStore } from './structures/SlashCommands/SlashCommandStore';

declare module 'discord.js' {
	interface Client {
		manager: LavalinkHandler;
		timeouts: Collection<string, NodeJS.Timeout>;
		sleep(ms: number): Promise<unknown>;
	}
}

declare module '@sapphire/framework' {
	interface StoreRegistryEntries {
		slashCommands: SlashCommandStore;
	}
}
