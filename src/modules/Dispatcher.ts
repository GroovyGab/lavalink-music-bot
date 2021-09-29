import { Guild, TextBasedChannels, MessageEmbed } from 'discord.js';
import type { SapphireClient } from '@sapphire/framework';
import type { ShoukakuPlayer } from 'shoukaku';
import type { ShoukakuTrack } from 'shoukaku/types/Constants';

export default class Dispatcher {
	client: SapphireClient;
	guild: Guild;
	channel: TextBasedChannels;
	player: ShoukakuPlayer;
	queue: ShoukakuTrack[];
	repeat: 'off' | 'all' | 'one';
	current: undefined | null | ShoukakuTrack;
	stopped: boolean;
	constructor({ client, guild, channel, player }: { client: SapphireClient; guild: Guild; channel: TextBasedChannels; player: ShoukakuPlayer }) {
		this.client = client;
		this.guild = guild;
		this.channel = channel;
		this.player = player;
		this.queue = [];
		this.repeat = 'off';
		this.current = null;
		this.stopped = false;

		let _notifiedOnce = false;

		this.player.on('start', () => {
			if (this.repeat === 'one' || this.queue.length < 1) {
				if (_notifiedOnce) return;
				else _notifiedOnce = true;
			}
		});

		this.player.on('end', () => {
			if (this.repeat === 'one') this.queue.unshift(this.current!);
			if (this.repeat === 'all') this.queue.push(this.current!);
			this.play();
		});

		this.player.on('closed', (data) => {
			if (data instanceof Error || data instanceof Object) this.client.logger.error(data);
			this.queue.length = 0;
			this.destroy(data.reason);
			const $EMBED = new MessageEmbed().setDescription('There was an unexpected error, try again later.').setColor('RED');
			this.channel.send({ embeds: [$EMBED] });
		});

		this.player.on('error', (data) => {
			if (data instanceof Error) this.client.logger.error(data);
			this.queue.length = 0;
			this.destroy(data.message);
			const $EMBED = new MessageEmbed().setDescription('There was an unexpected error, try again later.').setColor('RED');
			this.channel.send({ embeds: [$EMBED] });
		});
	}

	static humanizeTime(ms: number) {
		const seconds = Math.floor((ms / 1000) % 60);
		const minutes = Math.floor((ms / 1000 / 60) % 60);
		return [minutes.toString().padStart(2, '0'), seconds.toString().padStart(2, '0')].join(':');
	}

	get exists() {
		return this.client.queue.has(this.guild.id);
	}

	public play() {
		if (!this.exists || !this.queue.length) return this.destroy('Queue end.');
		this.current = this.queue.shift();
		this.player.setVolume(0.3).playTrack(this.current!.track);
	}

	public destroy(reason: any) {
		this.queue.length = 0;
		this.player.connection.disconnect();
		this.client.queue.delete(this.guild.id);
		this.client.logger.debug(
			this.player.constructor.name,
			`Destroyed the player and connection at guild ${this.guild.name}[${this.guild.id}]\nReason: ${reason || 'No Reason Provided.'}`
		);
		if (this.stopped) return;
		const $EMBED = new MessageEmbed().setDescription('Queue has ended, feel free to add more songs using `%play`.');
		this.channel.send({ embeds: [$EMBED] }).catch(() => null);
	}
}
