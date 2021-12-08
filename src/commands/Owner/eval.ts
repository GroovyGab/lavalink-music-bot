import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Type } from '@sapphire/type';
import { codeBlock, isThenable } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';
import { performance } from 'perf_hooks';
import { inspect } from 'util';

@ApplyOptions<CommandOptions>({
	aliases: ['ev'],
	description: 'Evaluates any JavaScript code',
	quotes: [],
	preconditions: ['OwnerOnly'],
	flags: ['async', 'hidden', 'showHidden', 'silent', 's'],
	options: ['depth']
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		const startTimestamp = performance.now();
		const code = await args.rest('string');
		const embedReply = new MessageEmbed();

		const { result, success, type } = await this.eval(message, code, {
			async: args.getFlags('async'),
			depth: Number(args.getOption('depth')) ?? 0,
			showHidden: args.getFlags('hidden', 'showHidden')
		});

		const tookMs = performance.now();

		const output = success ? codeBlock('js', result) : codeBlock('bash', result);

		if (args.getFlags('silent', 's')) return null;

		if (output.length > 1024) {
			embedReply
				.setAuthor(this.container.client.user?.username!, this.container.client.user?.avatarURL()!)
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
				.setFooter(`Evaluated by ${message.author.tag}`, message.author.avatarURL()!)
				.setColor('AQUA');

			return send(message, {
				files: [{ attachment: Buffer.from(output), name: 'output.txt' }],
				embeds: [embedReply]
			});
		}

		embedReply
			.setAuthor(this.container.client.user?.username!, this.container.client.user?.avatarURL()!)
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
			.setFooter(`Evaluated by ${message.author.tag}`, message.author.avatarURL()!)
			.setColor('AQUA');

		return send(message, { embeds: [embedReply] });
	}

	//@ts-ignore
	private async eval(message: Message, code: string, flags: { async: boolean; depth: number; showHidden: boolean }) {
		if (flags.async) code = `(async () => {\n${code}\n})();`;

		let success = true;
		let result = null;

		try {
			result = eval(code);
		} catch (error) {
			if (error && error instanceof Error && error.stack) {
				this.container.client.logger.error(error);
			}
			//@ts-ignore
			result = error.message;
			success = false;
		}

		const type = new Type(result).toString();
		if (isThenable(result)) result = result;

		if (typeof result !== 'string') {
			result = inspect(result, {
				depth: flags.depth,
				showHidden: flags.showHidden
			});
		}

		return { result, success, type };
	}
}
