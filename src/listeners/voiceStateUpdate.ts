import type { ListenerOptions, PieceContext } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';
import { MessageEmbed, StageChannel, VoiceChannel, VoiceState } from 'discord.js';

export class VoiceStateUpdateEvent extends Listener<typeof Events.VoiceStateUpdate> {
	public constructor(context: PieceContext, options?: ListenerOptions) {
		super(context, {
			...options,
			event: Events.VoiceStateUpdate
		});
	}

	public async run(_oldState: VoiceState, _newState: VoiceState) {
		const erelaPlayer = this.container.client.manager.get(_oldState.guild.id);

		if (erelaPlayer) {
			if (this.getSizeWithoutBots(_oldState.channel) === 0) {
				this.container.logger.info(
					`There are no users left in channel ${_oldState.channel?.name}[${_oldState.channel?.id}] from guild ${_oldState.guild.name}[${_oldState.channel?.id}], Disconnecting after ${process.env.DISCONNECT_DELAY} seconds.`
				);

				setTimeout(() => {
					if (this.getSizeWithoutBots(_oldState.channel) === 0) {
						const channel = this.container.client.channels.cache.get(erelaPlayer.textChannel!);

						if (channel && channel.isText()) {
							/**
							 * Groovy message lol
							 *
							 * I left the voice channel because I was inactive for too long. If you are a Premium member, you can disable this by typing /247.
							 */
							const embed = new MessageEmbed().setDescription(`I left the voice channel because I was inactive for too long`);
							channel.send({ embeds: [embed] });
						}
						erelaPlayer.destroy();
					} else {
						this.container.logger.info(
							`The bot will not disconnect, There are users in the voice channel: ${_oldState.channel?.name}[${_oldState.channel?.id}] from guild ${_oldState.guild.name}[${_oldState.channel?.id}]`
						);
					}
				}, parseInt(process.env.DISCONNECT_DELAY!) * 1000);
			}
		}
	}

	private getSizeWithoutBots(channel: VoiceChannel | StageChannel | null) {
		if (!channel) return;

		return channel.members.reduce((s, member) => {
			if (!member.user.bot) {
				s++;
			}

			return s;
		}, 0);
	}
}
