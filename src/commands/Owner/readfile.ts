import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

@ApplyOptions<CommandOptions>({
	name: 'readfile',
	aliases: ['rf'],
	description: 'lol.',

	fullCategory: ['Owner']
})
export class FastForwardCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		if (!message.guild) return;
		if (!message.member) return;
		if (!message.guild.me) return;

		try {
			const fileRoute = await args.rest('string');

			const file = fs.readFileSync(path.join(`${__dirname}/../../${fileRoute}`), 'utf-8');

			console.log(file);
		} catch (error) {}
	}
}
