import type { ChatInputCommandSuccessPayload, ListenerOptions, PieceContext } from '@sapphire/framework';
import { Command, Events, Listener, LogLevel } from '@sapphire/framework';
import type { Logger } from '@sapphire/plugin-logger';
import { cyan } from 'colorette';
import type { Guild, User } from 'discord.js';

export class UserEvent extends Listener<typeof Events.ChatInputCommandSuccess> {
	public constructor(context: PieceContext, options?: ListenerOptions) {
		super(context, {
			...options,
			event: Events.ChatInputCommandSuccess
		});
	}

	public run({ interaction, command }: ChatInputCommandSuccessPayload) {
		const shard = this.shard(interaction.guild?.shardId ?? 0);
		const commandName = this.command(command);
		const author = this.author(interaction.user);
		const sentAt = interaction.guild ? this.guild(interaction.guild) : this.direct();
		this.container.logger.debug(`${shard} - ${commandName} ${author} ${sentAt}`);
		this.container.client.statcord.postCommand(Buffer.from(commandName, 'utf-8').toString(), interaction.user.id);
	}

	public onLoad() {
		this.enabled = (this.container.logger as Logger).level <= LogLevel.Debug;
		return super.onLoad();
	}

	private shard(id: number) {
		return `[${cyan(id.toString())}]`;
	}

	private command(command: Command) {
		return cyan(command.name);
	}

	private author(author: User) {
		return `${author.username}[${cyan(author.id)}]`;
	}

	private direct() {
		return cyan('Direct Messages');
	}

	private guild(guild: Guild) {
		return `${guild.name}[${cyan(guild.id)}]`;
	}
}
