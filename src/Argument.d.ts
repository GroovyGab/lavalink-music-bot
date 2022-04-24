import type { Collection, User } from 'discord.js';
import type { Player, Track } from 'erela.js';
import type { LavalinkHandler } from './structures/Music/LavalinkHandler';
import type { Queue } from './structures/Music/Queue';

declare module 'discord.js' {
	interface Client {
		manager: LavalinkHandler;
		sleep(ms: number): Promise<unknown>;
	}
}

declare module '@sapphire/framework' {
	interface StoreRegistryEntries {
		slashCommands: SlashCommandStore;
	}

	interface Preconditions {
		OwnerOnly: never;
	}
}

declare module 'erela.js' {
	interface Player {
		existingLeaveTimeout?: boolean;
	}
}

export interface ExtendedTrack extends Track {
	readonly requester: User;
}
