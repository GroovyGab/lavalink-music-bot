import { container, Listener } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import type { Player, Track } from 'erela.js';

export class NodeReconnectEvent extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            emitter: container.client.manager,
            event: 'trackError'
        });
    }

    public run(player: Player, track: Track) {
        const guild = this.container.client.guilds.cache.get(player.guild);
        const channel = this.container.client.channels.cache.get(player.textChannel!);
        const embedReply = new MessageEmbed();

        this.container.logger.error(
            `Track "${track.title}" by "${track.author}" had an error during playback in guild ${guild?.name}[${guild?.id}]`
        );

        if (!channel?.isText()) return;

        embedReply.setDescription(`Track "${track.title}" requested by [${track.requester}] had an error during playback, Skipping...`);

        channel.send({ embeds: [embedReply] });

        player.stop();
    }
}
