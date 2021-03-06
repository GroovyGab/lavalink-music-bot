import { Command } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';

export class VolumeCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'volume',
			description: 'Sets/shows the player\'s volume; If you input "reset", it will set the volume back to default.',
			chatInputCommand: {
				register: true
			}
		});
	}

	public async chatInputRun(interaction: Command.ChatInputInteraction) {
		if (!interaction.guild) return;
		if (!interaction.member) return;
		if (!interaction.guild.me) return;
		if (!interaction.channel) return;

		const erelaPlayer = this.container.client.manager.get(interaction.guild.id);
		const embedReply = new MessageEmbed();
		const userVoiceChannel = interaction.guild.members.cache.get(interaction.user.id)?.voice.channel;
		const botVoiceChannel = interaction.guild.me?.voice.channel;

		try {
			const volume = parseInt(interaction.options.getString('volume')!);

			if (!userVoiceChannel) {
				embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
				return interaction.reply({ embeds: [embedReply] });
			}

			if (!erelaPlayer) {
				embedReply.setDescription("There isn't an active player on this server!");
				return interaction.reply({ embeds: [embedReply] });
			}

			if ((!erelaPlayer.playing && !erelaPlayer.paused) || !erelaPlayer.queue.current) {
				embedReply.setDescription("There's nothing currently playing on this server!");
				return interaction.reply({ embeds: [embedReply] });
			}

			if (erelaPlayer && botVoiceChannel && userVoiceChannel.id !== botVoiceChannel.id) {
				embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!');
				return interaction.reply({ embeds: [embedReply] });
			}

			if (!volume) {
				embedReply.setDescription(`The volume is currently set at \`${erelaPlayer.volume}%\``);
				return interaction.reply({ embeds: [embedReply] });
			}

			if (!volume || volume < 0 || volume > 100) {
				embedReply.setDescription('The volume needs to be a value between 0 and 100.');
				return interaction.reply({ embeds: [embedReply] });
			}

			if (isNaN(volume)) {
				embedReply.setDescription(`The value must be a number/float!`);
				return interaction.reply({ embeds: [embedReply] });
			}

			erelaPlayer.setVolume(volume);
			embedReply.setDescription(`The volume was changed to \`${volume}%\``);
			return interaction.reply({ embeds: [embedReply] });
		} catch (error) {
			this.container.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return interaction.reply({ embeds: [embedReply] });
		}
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) => option.setName('volume').setDescription('The volume to be set (100% max).').setRequired(false))
		);
	}
}
/**
 * Module imports.
 */
/*import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'volume',
	description: 'Sets the player\'s volume; If you input "reset", it will set the volume back to default.'
})
export class VolumeCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		if (!message.guild) return;
		const erelaPlayer = this.container.client.manager.get(message.guild.id);
		const embedReply = new MessageEmbed();
		const { channel: userVoiceChannel } = message.member?.voice!;
		const { channel: botVoiceChannel } = message.guild.me?.voice!;

		try {
			const volume = await args.rest('float');
			if (!userVoiceChannel) {
				embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
				return interaction.reply({ embeds: [embedReply] });
			}

			if (!erelaPlayer) {
				embedReply.setDescription("There isn't an active player on this server!");
				return interaction.reply({ embeds: [embedReply] });
			}

			if ((!erelaPlayer.playing && !erelaPlayer.paused) || !erelaPlayer.queue.current) {
				embedReply.setDescription("There's nothing currently playing on this server!");
				return interaction.reply({ embeds: [embedReply] });
			}

			if (erelaPlayer && botVoiceChannel && userVoiceChannel.id !== botVoiceChannel.id) {
				embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!');
				return interaction.reply({ embeds: [embedReply] });
			}

			if (!volume || volume < 0 || volume > 100) {
				embedReply.setDescription('The volume needs to be a value between 0 and 100.');
				return interaction.reply({ embeds: [embedReply] });
			}

			erelaPlayer.setVolume(volume);
			embedReply.setDescription(`The volume was changed to \`${volume}%\``);
			return interaction.reply({ embeds: [embedReply] });
		} catch (error: any) {
			if (error.identifier === 'argsMissing') {
				if (!userVoiceChannel) {
					embedReply.setDescription('You have to be connected to a voice channel before you can use this command!');
					return interaction.reply({ embeds: [embedReply] });
				}

				if (erelaPlayer && botVoiceChannel && userVoiceChannel.id !== botVoiceChannel.id) {
					embedReply.setDescription('You need to be in the same voice channel as the bot before you can use this command!');
					return interaction.reply({ embeds: [embedReply] });
				}

				if (!erelaPlayer) {
					embedReply.setDescription("There isn't an active player on this server!");
					return interaction.reply({ embeds: [embedReply] });
				}

				if ((!erelaPlayer.playing && !erelaPlayer.paused) || !erelaPlayer.queue.current) {
					embedReply.setDescription("There's nothing currently playing on this server!");
					return interaction.reply({ embeds: [embedReply] });
				}

				embedReply.setDescription(`The volume is currently set at \`${erelaPlayer.volume}%\``);
				return interaction.reply({ embeds: [embedReply] });
			}

			if (error.identifier === 'floatError') {
				embedReply.setDescription(`The value must be a number/float!`);
				return interaction.reply({ embeds: [embedReply] });
			}

			this.container.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return interaction.reply({ embeds: [embedReply] });
		}
	}
}*/
