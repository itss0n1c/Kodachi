/* eslint-disable no-unused-vars */

import { Message, Client, MessageEmbed, Webhook, PermissionString } from 'discord.js';
import { Arguments } from './Arguments';
import Kodachi from '.';
import { Plugin } from './Plugin';
import { CmdEnv } from './CmdEnv';


interface CommandResponse {
	(bot: typeof Kodachi.prototype, msg?: Message, args?: Arguments, env?: CmdEnv): Promise<string | MessageEmbed | Message> | string | MessageEmbed | Message;
}

interface MessageWithHook extends Message {
	hook: Webhook
}

export class Command {
	client: Client;
	plugin: Plugin
	arguments: {
		name: string
		unlimited: boolean
		optional: boolean
		typeof: 'string' | 'number' | 'BigInt' | 'boolean' | 'any' | any[]
	}[];

	name: string;
	ownerOnly: boolean;
	hasPerm: PermissionString[] = []
	description: string;
	disabled: boolean
	response: (bot: Kodachi, msg?: Message, args?: Arguments, env?: CmdEnv) => Promise<string | MessageEmbed | Message> | string | MessageEmbed | Message;

	constructor(info: {
		name: string;
		ownerOnly: boolean;
		description: string;
		arguments: {
			name: string;
			unlimited: boolean;
			typeof: 'string' | 'number' | 'BigInt' | 'boolean' | 'any' | any[];
			optional: boolean;
		}[],
		hasPerm?: PermissionString[]
	}) {
		this.name = info.name;
		this.ownerOnly = info.ownerOnly;
		this.arguments = info.arguments;
		this.description = info.description;
		if (typeof info.hasPerm !== 'undefined') {
			this.hasPerm = info.hasPerm;
		}

		this.disabled = false;

		// eslint-disable-next-line no-unused-expressions
		this.response;
	}

	async run(
		cb: (bot: typeof Kodachi.prototype, msg?: MessageWithHook, args?: Arguments, env?: CmdEnv) => Promise<string | MessageEmbed | Message> | string | MessageEmbed | Message
	): Promise<CommandResponse> {
		this.response = cb;

		return this.response;
	}


	async handler(bot: typeof Kodachi.prototype, msg: Message, hook: Webhook, args: Arguments, env: CmdEnv): Promise<string | MessageEmbed | Message> {
		console.log(this);
		// eslint-disable-next-line no-useless-call
		const newMsg: any = msg;
		newMsg.hook = hook;

		if (typeof this.response === 'undefined') {
			throw `Command \`${this.name}\` has no response handler!`;
		}

		return this.response(bot, newMsg, args, env);
	}

	cleanMD(str: string): string {
		const escaped = [ '\\', '[', ':', '*', '`', '_', '~' ];
		for (const char of escaped) {
			str = str.split(char).join(`\\${char}`);
		}

		return str;
	}
}

