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
        const embedReply = new MessageEmbed();

        embedReply.setDescription(`Queue has ended, feel free to add more songs using  \`${process.env.PREFIX}play\`.`);

        const guild = this.container.client.guilds.cache.get(player.guild);
        const channel = this.container.client.channels.cache.get(player.textChannel);

        if (!channel?.isText()) return;

        this.container.logger.info(`Queue ended in guild ${guild?.name}[${guild?.id}]`);
        channel.send({ embeds: [embedReply] });
    }
}
