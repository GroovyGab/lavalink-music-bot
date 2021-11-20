import { Piece, PieceContext } from '@sapphire/framework';
import type { Awaitable } from '@sapphire/utilities';
import type {
	ApplicationCommandData,
	ApplicationCommandOptionData,
	CommandInteraction
} from 'discord.js';

export abstract class SlashCommand extends Piece {
	public readonly commandData: Options;
	public readonly guildOnly: boolean;
	constructor(context: PieceContext, options: Options) {
		super(context, options);

		// This is the payload the "deployer" requires to register the commands
		// at Discord.
		this.commandData = {
			name: this.name,
			description: options.description ?? 'No description provided',
			options: options.options ?? [],
			defaultPermission: options.defaultPermission ?? true
		};

		// This line is a juicy one, and only comes into effect if you're loading
		// both global and guild commands alike, true for guild, false for global.
		this.guildOnly = options.guildOnly ?? false;
	}

	public abstract run(interaction: CommandInteraction): Awaitable<unknown>;
}

export type Options = ApplicationCommandData & {
	description: string;
	options?: ApplicationCommandOptionData[];
	defaultPermission?: boolean;
	guildOnly?: boolean;
};
