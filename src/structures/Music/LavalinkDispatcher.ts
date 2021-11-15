import { Guild, MessageEmbed, TextBasedChannels } from 'discord.js';
import type { ShoukakuPlayer, ShoukakuTrack } from 'shoukaku';
import type { MusicBotClient } from '../Client';

export class LavalinkDispatcher {
	client: MusicBotClient;
	guild: Guild;
	channel: TextBasedChannels;
	player: ShoukakuPlayer;
	queue: ShoukakuTrack[];
	repeat: 'off' | 'all' | 'one';
	current: undefined | null | ShoukakuTrack;
	stopped: boolean;
	embedReply: MessageEmbed;
	constructor({ client, guild, channel, player }: { client: MusicBotClient; guild: Guild; channel: TextBasedChannels; player: ShoukakuPlayer }) {
		this.client = client;
		this.guild = guild;
		this.channel = channel;
		this.player = player;
		this.queue = [];
		this.repeat = 'off';
		this.current = null;
		this.stopped = false;
		this.embedReply = new MessageEmbed();

		let notifiedOnce = false;

		this.player.on('start', () => {
			if (this.repeat === 'one' || this.queue.length < 1) {
				if (notifiedOnce) {
					return;
				} else {
					notifiedOnce = true;
				}
			}
		});

		this.player.on('end', () => {
			if (this.repeat === 'one') {
				this.queue.unshift(this.current!);
			}

			if (this.repeat === 'all') {
				this.queue.push(this.current!);
			}

			this.play();
		});

		this.player.on('closed', (data) => {
			const guild = this.client.guilds.cache.get(data.guildId);
			this.client.logger.info(`Player was closed in guild ${guild?.name}[${guild?.id}], Reason: ${data.reason}`);
			this.embedReply.setDescription(`The player was disconnected.`);
			this.channel.send({ embeds: [this.embedReply] });
		});

		this.player.on('exception', (data) => {
			const guild = this.client.guilds.cache.get(data.guildId);
			this.client.logger.error(`A player had an error in guild ${guild?.name}[${guild?.id}], Error: ${data.error}`);
		});
	}

	//@ts-ignore
	private humanizeTime(ms: number) {
		const seconds = Math.floor((ms / 1000) % 60);
		const minutes = Math.floor((ms / 1000 / 60) % 60);
		return [minutes.toString().padStart(2, '0'), seconds.toString().padStart(2, '0')].join(':');
	}

	get exists() {
		return this.client.queue.has(this.guild.id);
	}

	public play() {
		if (!this.exists || !this.queue.length) {
			this.embedReply.setDescription('Queue has ended, feel free to add more songs using `%play`.');
			this.current = null;
			this.channel.send({ embeds: [this.embedReply] });
			return;
			//return this.destroy('Queue ended.');
		}

		this.current = this.queue.shift();
		this.player.setVolume(0.3);
		this.player.playTrack(this.current!.track);
	}
	public destroy(reason: any) {
		this.queue.length = 0;
		this.player.connection.disconnect();
		this.client.queue.delete(this.guild.id);
		this.client.logger.debug(
			`Destroyed the player and connection at guild ${this.guild.name}[${this.guild.id}], Reason: ${reason || 'No Reason Provided.'}`
		);
		if (this.stopped) return;
	}
}
