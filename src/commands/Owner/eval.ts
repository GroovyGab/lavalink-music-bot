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
	description: 'Evals any JavaScript code',
	quotes: [],
	preconditions: ['OwnerOnly'],
	flags: ['async', 'hidden', 'showHidden', 'silent', 's'],
	options: ['depth']
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		const startTimestamp = performance.now();
		const code = await args.rest('string');

		const { result, success, type } = await this.eval(message, code, {
			async: args.getFlags('async'),
			depth: Number(args.getOption('depth')) ?? 0,
			showHidden: args.getFlags('hidden', 'showHidden')
		});

		const tookMs = performance.now();

		const output = success ? codeBlock('js', result) : `**ERROR**: ${codeBlock('bash', result)}`;
		if (args.getFlags('silent', 's')) return null;

		const typeFooter = `**Type**: ${codeBlock('typescript', type)}`;

		if (output.length > 2000) {
			return send(message, {
				content: `Output was too long... sent the result as a file.\n\n${typeFooter}`,
				files: [{ attachment: Buffer.from(output), name: 'output.txt' }]
			});
		}

		const embedReply = new MessageEmbed()
			.setAuthor(this.container.client.user?.username!, this.container.client.user?.avatarURL()!)
			.setDescription('**Evaluation complete!**')
			.addFields([
				{
					name: 'Type',
					value: `\`\`\`typescript\n${type}\`\`\``,
					inline: true
				},
				{
					name: 'Evaluated in',
					value: `\`\`\`css\n${Math.floor(tookMs) - Math.floor(startTimestamp)}ms\`\`\``,
					inline: true
				},
				{
					name: 'Input',
					value: `\`\`\`javascript\n${code}\`\`\``
				},
				{
					name: 'Output',
					value: output
				}
			])
			.setFooter(`Evaluated by ${message.author.tag}`, message.author.avatarURL()!)
			.setColor('AQUA');

		return message.channel.send({ embeds: [embedReply] });
	}

	private async eval(_message: Message, code: string, flags: { async: boolean; depth: number; showHidden: boolean }) {
		if (flags.async) code = `(async () => {\n${code}\n})();`;

		let success = true;
		let result = null;

		try {
			// eslint-disable-next-line no-eval
			result = eval(code);
		} catch (error) {
			if (error && error instanceof Error && error.stack) {
				this.container.client.logger.error(error);
			}
			result = error;
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
