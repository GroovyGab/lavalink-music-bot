import { container, Listener } from '@sapphire/framework';
import type { Player } from 'erela.js';

export class NodeReconnectEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.client.manager,
			event: 'playerMove'
		});
	}

	public async run(player: Player, _initCHannel: string, newVoiceChannel: string) {
		if (!player) return;
		const guild = this.container.client.guilds.cache.get(player.guild);
		const newChannelFetch = this.container.client.channels.cache.get(newVoiceChannel);

		if (!newVoiceChannel) {
			this.container.logger.info(`Player was disconnected from voice channel in guild ${guild?.name}[${guild?.id}]`);
			player.destroy();
		} else {
			player.setVoiceChannel(newVoiceChannel);
			player.pause(true);

			await this.container.client.sleep(1000);

			if (!newChannelFetch || !newChannelFetch.isVoice()) return;

			if (newChannelFetch.type === 'GUILD_STAGE_VOICE') {
				const newVCBotPerms = newChannelFetch.permissionsFor(newChannelFetch.guild.me!);
				if (newVCBotPerms.has('MANAGE_CHANNELS') || newVCBotPerms.has('MUTE_MEMBERS') || newVCBotPerms.has('MOVE_MEMBERS')) {
					newChannelFetch.guild.me!.voice.setSuppressed(false);
				}
			}

			player.pause(false);

			this.container.logger.info(
				`Player was moved from voice channel "${_initCHannel}" to "${newVoiceChannel}" in guild ${guild?.name}[${guild?.id}]`
			);
		}
	}
}
