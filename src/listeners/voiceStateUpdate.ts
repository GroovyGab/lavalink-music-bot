import type { ListenerOptions, PieceContext } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';
import type { /* MessageEmbed,*/ VoiceState } from 'discord.js';

export class UserEvent extends Listener<typeof Events.VoiceStateUpdate> {
	public constructor(context: PieceContext, options?: ListenerOptions) {
		super(context, {
			...options,
			event: Events.VoiceStateUpdate
		});
	}

	public run(_oldState: VoiceState, _newState: VoiceState) {
		// This is a super bad system
		/*const erelaPlayer = this.container.client.players.get(oldState.guild.id);

		if (erelaPlayer) {
			const voiceChannel = this.container.client.channels.cache.get(erelaPlayer.voiceChannel!);

			if (voiceChannel?.isVoice()) {
				const voiceChannelMembers = voiceChannel.members.filter((user) => !user.user.bot).size;
				const guild = this.container.client.guilds.cache.get(erelaPlayer.guild);
				const channel = this.container.client.channels.cache.get(erelaPlayer.textChannel!);
				const embedReply = new MessageEmbed();

				if (voiceChannelMembers === 0) {
					const timeout = setTimeout(() => {
						erelaPlayer.destroy();

						if (!channel?.isText()) return;
						embedReply.setDescription('I left the voice channel because I was inactive for too long, you can disable this by typing **+247**.');
						return channel.send({ embeds: [embedReply] });
					}, parseInt(process.env.DISCONNECT_DELAY!));

					this.container.client.timeouts.set(oldState.guild.id, timeout);

					this.container.client.logger.info(`Voice channel was left empty in guild ${guild?.name}[${guild?.id}], Disconnecting after ${process.env.DISCONNECT_DELAY}ms`);
				} else {
					const timeout = this.container.client.timeouts.get(oldState.guild.id);

					if (!timeout) return;
					clearTimeout(timeout);
					this.container.client.timeouts.delete(oldState.guild.id);
					this.container.client.logger.info(`Inactivity disconnect timeout was cleared in guild ${guild?.name}[${guild?.id}]`);
				}
			}
		}*/
	}
}
