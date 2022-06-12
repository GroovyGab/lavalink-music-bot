import { Command } from '@sapphire/framework';
import { Type } from '@sapphire/type';
import { codeBlock, isThenable } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import { performance } from 'perf_hooks';
import { inspect } from 'util';

export class EvalCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'eval',
			description: 'Evaluates any JavaScript code.',
			preconditions: ['OwnerOnly'],
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

		const startTimestamp = performance.now();
		const code = interaction.options.getString('code')!;
		const evalAsync = interaction.options.getBoolean('async');
		const embedReply = new MessageEmbed();

		const { result, success, type } = await this.eval(interaction, code, {
			async: evalAsync ? true : false
		});

		const tookMs = performance.now();

		const output = success ? codeBlock('js', result) : codeBlock('bash', result);

		if (output.length > 1024) {
			embedReply
				.setAuthor({ name: this.container.client.user?.username!, iconURL: this.container.client.user?.avatarURL()! })
				.setDescription('**Evaluation complete!**')
				.addFields([
					{
						name: 'Type',
						value: codeBlock('typescript', type),
						inline: true
					},
					{
						name: 'Evaluated in',
						value: codeBlock('css', `${Math.floor(tookMs) - Math.floor(startTimestamp)}ms`),
						inline: true
					},
					{
						name: 'Input',
						value: codeBlock('js', code)
					},
					{
						name: 'Output',
						value: 'Too long, sent as a file.'
					}
				])
				.setFooter({ text: `Evaluated by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL()! })
				.setColor('AQUA');

			return interaction.reply({ files: [{ attachment: Buffer.from(output), name: 'output.txt' }], embeds: [embedReply] });
		}

		embedReply
			.setAuthor({ name: this.container.client.user?.username!, iconURL: this.container.client.user?.avatarURL()! })
			.setDescription('**Evaluation complete!**')
			.addFields([
				{
					name: 'Type',
					value: codeBlock('typescript', type),
					inline: true
				},
				{
					name: 'Evaluated in',
					value: codeBlock('css', `${Math.floor(tookMs) - Math.floor(startTimestamp)}ms`),
					inline: true
				},
				{
					name: 'Input',
					value: codeBlock('js', code)
				},
				{
					name: 'Output',
					value: output
				}
			])
			.setFooter({ text: `Evaluated by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL()! })
			.setColor('AQUA');

		return interaction.reply({ embeds: [embedReply] });
	}

	//@ts-ignore
	private async eval(interaction: Command.ChatInputInteraction, code: string, flags: { async: boolean }) {
		if (flags.async) code = `(async () => {\n${code}\n})();`;

		let success = true;
		let result = null;

		try {
			result = eval(code);
		} catch (error) {
			if (error && error instanceof Error && error.stack) {
				this.container.logger.error(error);
			}
			//@ts-ignore
			result = error.message;
			success = false;
		}

		const type = new Type(result).toString();
		if (isThenable(result)) result = result;

		if (typeof result !== 'string') {
			result = inspect(result);
		}

		return { result, success, type };
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) => option.setName('code').setDescription('The JavaScript code to be evaluated.').setRequired(true))
				.addBooleanOption((option) =>
					option.setName('async').setDescription('Whether the code should be run in async mode or not.').setRequired(false)
				)
		);
	}
}
