import { container, Listener } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import type { Player } from 'erela.js';

export class NodeReconnectEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.client.manager,
			event: 'queueEnd'
		});
	}

	public run(player: Player) {
		if (!player.textChannel) return;
		const erelaPlayer = this.container.client.manager.get(player.guild);

		if (erelaPlayer) {
			const voiceChannel = this.container.client.channels.cache.get(player.voiceChannel!);
			if (voiceChannel?.isVoice()) {
				this.container.logger.debug(`Starting inactivity timeout in: ${voiceChannel.name} (${voiceChannel.id})`);
				if (!erelaPlayer.existingLeaveTimeout) {
					erelaPlayer.existingLeaveTimeout = true;
					setTimeout(() => {
						if (!player.playing) {
							const channel = this.container.client.channels.cache.get(erelaPlayer.textChannel!);

							if (channel && channel.isText()) {
								// Groovy message lol

								// I left the voice channel because I was inactive for too long. If you are a Premium member, you can disable this by typing /247.

								const embed = new MessageEmbed().setDescription(`I left the voice channel because I was inactive for too long`);
								channel.send({ embeds: [embed] });
							}
							erelaPlayer.destroy();
						} else {
							this.container.logger.info(
								`The bot will not disconnect, the player is active in ${voiceChannel.name} [${voiceChannel.id}] from guild ${voiceChannel.guild.name} [${voiceChannel.id}]`
							);
						}
					}, parseInt(process.env.DISCONNECT_DELAY!) * 1000);
				}
			}
		}
		const embedReply = new MessageEmbed();

		embedReply.setDescription(`Queue has ended, feel free to add more songs using  \`/play\`.`);

		const guild = this.container.client.guilds.cache.get(player.guild);
		const channel = this.container.client.channels.cache.get(player.textChannel);

		if (!channel?.isText()) return;

		this.container.logger.info(`Queue ended in guild ${guild?.name}[${guild?.id}]`);
		channel.send({ embeds: [embedReply] });
	}
}
