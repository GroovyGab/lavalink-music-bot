import type { Collection, User } from 'discord.js';
import type { Player, Track } from 'erela.js';
import type { LavalinkHandler } from './structures/Music/LavalinkHandler';
import type { Queue } from './structures/Music/Queue';
import { Client as StatcordClient } from 'statcord.js';

declare module 'discord.js' {
	interface Client {
		manager: LavalinkHandler;
		sleep(ms: number): Promise<unknown>;
		statcord: StatcordClient;
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
