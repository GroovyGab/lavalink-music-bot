import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'help',
	description: "Shows the help page for all the bot's commands.",
	fullCategory: ['info']
})
export class TwentyFourSevenCommand extends Command {
	public async messageRun(message: Message) {
		if (!message.guild) return;
		if (!message.member) return;
		if (!message.guild.me) return;

		const embedReply = new MessageEmbed();

		//@ts-ignore
		const paginatedMessage = new PaginatedMessage({
			template: new MessageEmbed().setTitle(`Help for ${this.container.client.user?.tag}`).setThumbnail(this.container.client.user?.avatarURL()!)
		});

		try {
			/**
			 * THIS IS A FUCKING MESS, WILL FIX LATER
			 */
			const commands = this.container.client.stores.get('commands');

			const cmdNamesArr = [];

			for (const command of commands) {
				cmdNamesArr.push(command[1].name);
			}

			cmdNamesArr.sort();

			const cmdNameArrChunks = cmdNamesArr.reduce((resultArray: string[][], item, index) => {
				const chunkIndex = Math.floor(index / 5);
				if (!resultArray[chunkIndex]) {
					resultArray[chunkIndex] = [];
				}
				resultArray[chunkIndex].push(item);
				return resultArray;
			}, []);

			cmdNameArrChunks.forEach((chunk) => {
				paginatedMessage.addPageEmbed((embed) => {
					for (const name of chunk) {
						embed.addField(name, commands.get(name)?.description!);
					}
					return embed;
				});
			});

			return await paginatedMessage.run(message, message.author);
		} catch (error: any) {
			this.container.logger.error(`There was an unexpected error in command "${this.name}"`, error);
			embedReply.setDescription('There was an unexpected error while processing the command, try again later.');
			return message.channel.send({ embeds: [embedReply] });
		}
	}
}
