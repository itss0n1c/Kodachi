/* eslint-disable no-unused-vars */

import { Message, Client, MessageEmbed, Webhook } from 'discord.js';
import { Arguments } from './Arguments';
import { DiscordTS } from '.';


interface CommandResponse {
	(bot: typeof DiscordTS.prototype, msg?: Message, args?: Arguments): Promise<string | MessageEmbed | Message> | string | MessageEmbed | Message;
}

interface MessageWithHook extends Message {
	hook: Webhook
}

export class Command {
	client: Client;

	arguments: {
		name: string
		unlimited: boolean
		optional: boolean
		typeof: 'string' | 'number' | 'BigInt' | 'boolean' | 'any' | any[]
	}[];

	name: string;
	ownerOnly: boolean;
	description: string;
	response: (bot: DiscordTS, msg?: Message, args?: Arguments) => Promise<string | MessageEmbed | Message> | string | MessageEmbed | Message;

	constructor(info: {
		name: string;
		ownerOnly: boolean;
		description: string;
		arguments: {
			name: string;
			unlimited: boolean;
			typeof: 'string' | 'number' | 'BigInt' | 'boolean' | 'any' | any[];
			optional: boolean;
		}[];
	}) {
		this.name = info.name;
		this.ownerOnly = info.ownerOnly;
		this.arguments = info.arguments;
		this.description = info.description;
		// eslint-disable-next-line no-unused-expressions
		this.response;
	}

	async run(
		cb: (bot: typeof DiscordTS.prototype, msg?: MessageWithHook, args?: Arguments) => Promise<string | MessageEmbed | Message> | string | MessageEmbed | Message
	): Promise<CommandResponse> {
		this.response = cb;

		return this.response;
	}


	async handler(bot: typeof DiscordTS.prototype, msg: Message, hook: Webhook, args: Arguments): Promise<string | MessageEmbed | Message> {
		console.log(this);
		// eslint-disable-next-line no-useless-call
		const newMsg: any = msg;
		newMsg.hook = hook;

		return this.response(bot, newMsg, args);
	}

	cleanMD(str: string): string {
		const escaped = [ '\\', '[', ':', '*', '`', '_', '~' ];
		for (const char of escaped) {
			str = str.split(char).join(`\\${char}`);
		}

		return str;
	}
}

