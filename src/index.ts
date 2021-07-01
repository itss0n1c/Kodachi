import { Command } from './Command';
import defaultPlugin from './plugins/defaults';
import miscPlugin from './plugins/misc';
import { Client, ColorResolvable, Intents, Message, MessageEmbed, Webhook } from 'discord.js';
import { Arguments } from './Arguments';
import DBProvider from './providers/DBProvider';
import JSONProvider from './providers/JSONProvider';
import { Plugin, Plugins } from './Plugin';
import GuildSettings from './providers/DBGuild';

interface ParserRes {status: boolean, code: number, type: string, cmd?: string, args?: string[], message?: string}

class Kodachi {
	prefix: string
	owners: string[]
	client: Client
	// commands: Command[]
	plugins: Plugins
	db: JSONProvider
	tint: ColorResolvable
	// eslint-disable-next-line no-undef
	[k: string]: any

	constructor(token: string, opts: {owners: string[], prefix?: string, plugins: Plugin[], cmdBlackList?: string[], tint?: ColorResolvable, db?: string, allIntents?: boolean}) {
		if (typeof token === 'undefined') {
			throw 'No token set.';
		}
		this.owners = opts.owners;
		this.prefix = opts.prefix || '/';
		this.tint = opts.tint || '#007aff';
		if (typeof opts.allIntents !== 'undefined' && opts.allIntents) {
			this.client = new Client({ ws: {
				intents: Intents.ALL
			} });
		} else {
			this.client = new Client({ ws: {
				intents: [ 'GUILDS', 'GUILD_MESSAGES', 'GUILD_EMOJIS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGE_REACTIONS' ]
			} });
		}

		this.client.on('ready', () => {
			if (typeof opts.db !== 'undefined') {
				this.db = new JSONProvider(opts.db, this.client.users.cache, this.client.guilds.cache);
				console.log('Db loaded');
			} else {
				this.db = new JSONProvider(null, this.client.users.cache, this.client.guilds.cache);
			}
			this.plugins = new Plugins(this.db);
			this.plugins.set(defaultPlugin.name, defaultPlugin);
			this.plugins.set(miscPlugin.name, miscPlugin);
			if (typeof opts.cmdBlackList !== 'undefined' && opts.cmdBlackList.length > 0) {
				for (const c of opts.cmdBlackList) {
					const plugin = this.plugins.find(p => p.commands.has(c));
					const cmd = plugin.commands.get(c);
					cmd.disabled = true;
				}
			}
			for (const plugin of opts.plugins) {
				//	console.log(plugin);
				this.plugins.set(plugin.name, plugin);
			}

			this.client.user.setActivity({
				name: `on ${this.client.guilds.cache.array().length} servers`
			});
			console.log(`Logged in as ${this.client.user.tag}`);
		});

		this.client.on('message', async (message) => {
			await this.handleMessage(message);
		});


		this.client.on('guildCreate', () => {
			this.db.init({ users: this.client.users.cache,
				guilds: this.client.guilds.cache });
		});

		this.client.login(token);
	}

	async handleMessage(message: Message): Promise<Message> {
		const seq = Date.now();
		console.time(`parser-${seq}`);
		const parsed = this.parseMessage(message);
		console.log(parsed);
		console.timeEnd(`parser-${seq}`);

		if (parsed.status) {
			return this.handleResponse(message, parsed);
		}
		switch (parsed.type) {
			case 'bad-cmd':
				message.reply('That command name isn\'t valid');
				break;
			case 'parsing-error':
				this.send(`\`\`\`${parsed.message}\`\`\``, message);
				break;
		}
	}

	async handleResponse(message: Message, parsed: ParserRes): Promise<Message> {
		const seq = Date.now();
		console.time(`cmd-res-${seq}`);
		let res: string | MessageEmbed | Message;
		try {
			res = await this.run(message, parsed.cmd, parsed.args);
		} catch (e) {
			if (e === 404) {
				return;
			} else if (e === 403) {
				return this.send('This command is in a plugin that is diabled', message, true);
			}
			console.log({ tag: message.author.tag,
				server: (message.guild ? message.guild.name : message.author.tag) });
			console.log(e);
			this.send(e, message, true);
			return;
		}
		console.timeEnd(`cmd-res-${seq}`);

		if (res === null || typeof res === 'undefined') {
			return;
		}

		if (typeof res === 'string') {
			return this.send(res, message);
		}
		if (res.constructor.name === 'MessageEmbed') {
			console.log('name', res.constructor.name);
			return this.send(res as MessageEmbed, message);
		}
	}

	async send(content: string | MessageEmbed, msg: Message, error = false): Promise<Message> {
		let res: Message;
		if (typeof content === 'string') {
			const embed = new MessageEmbed();
			embed.setDescription(content);
			embed.setTimestamp();
			embed.setFooter(msg.author.tag, msg.author.displayAvatarURL({ format: 'png' }));
			embed.setColor(error ? 'RED' : this.tint);
			if (error) {
				embed.setTitle('Error!');
			}
			try {
				res = await msg.channel.send('', { embed });
			} catch (e) {
				msg.reply('Can\'t send a message, probably too big');
			}
		} else {
			try {
				res = await msg.channel.send('', { embed: content });
			} catch (e) {
				console.error(e);
				return this.send('Failed to send embed.', msg, true);
			}
		}
		return res;
	}

	async loadHook(msg: Message): Promise<Webhook> {
		const hooks = await msg.guild.fetchWebhooks();
		const matches = hooks.array().filter(hook => hook.guildID === msg.guild.id && hook.channelID === msg.channel.id);
		if (matches.length > 0) {
			return matches[0];
		}
		if (msg.channel.type === 'text') {
			const create = await msg.channel.createWebhook(this.client.user.username);

			return create;
		}
		throw 403;
	}

	async run(msg: Message, cmd_name: string, args: string[]): Promise<string | MessageEmbed | Message> {
		const seq = Date.now();
		let plugin: Plugin;
		for (const p of this.plugins.array()) {
			if (p.commands.has(cmd_name)) {
				console.log(cmd_name, p.name, p.commands.get(cmd_name));
				if (!p.commands.get(cmd_name).disabled) {
					plugin = p;
				}
			}
		}

		if (typeof plugin === 'undefined') {
			throw 404;
		}
		if (msg.channel.type !== 'dm') {
			const settings = this.db.guilds.get(msg.guild.id);
			if (settings.ps.has(plugin.name)) {
				if (!settings.ps.get(plugin.name)) {
					throw 403;
				}
			}
		}


		if (plugin.hasPerm.length > 0) {
			if (!this.owners.includes(msg.author.id)) {
				for (const perm of plugin.hasPerm) {
					if (!msg.member.permissions.has(perm)) {
						throw `You are missing the ${perm} permission!`;
					}
				}
			}
		}
		const cmd = plugin.commands.get(cmd_name);
		if (typeof cmd === 'undefined') {
			throw 404;
		}
		if (cmd.disabled) {
			throw 404;
		}
		if (cmd.ownerOnly) {
			if (!this.owners.includes(msg.author.id)) {
				throw `You aren't allowed to run the command \`${cmd_name}\``;
			}
		}
		if (cmd.hasPerm.length > 0) {
			if (!this.owners.includes(msg.author.id)) {
				for (const perm of cmd.hasPerm) {
					if (!msg.member.permissions.has(perm)) {
						throw `You are missing the ${perm} permission!`;
					}
				}
			}
		}
		const fixargs = new Arguments();
		if (cmd.arguments.length > 0 && args.length > 0) {
			if (cmd.arguments.length > 1) {
				if (cmd.arguments.filter(arg => arg.unlimited).length > 1) {
					throw 'There can only be one `unlimited` argument.';
				}
				if (cmd.arguments[0].unlimited) {
					throw 'The first argument cannot be set to `unlimited`';
				}
			} else {
				const arg = cmd.arguments[0];
				const firstarg = args[0];
				if (args.length >= 1 && arg.unlimited) {
					console.log('Hi');
					if (typeof arg.typeof === 'undefined') {
						arg.typeof = 'string';
					}
					if (arg.typeof !== 'any') {
						if (typeof firstarg !== arg.typeof) {
							throw `First argument given (\`${firstarg}\`) doesn't match the required type \`${arg.typeof}\``;
						}
						if (args.filter(a => typeof a !== typeof firstarg).length > 0) {
							throw `All of the arguments need to match the type \`${arg.typeof}\``;
						}
					}

					fixargs.set(arg.name, {
						name: arg.name,
						type: typeof args,
						value: args
					});
				} else {
					if (!arg.typeof.includes(typeof firstarg)) {
						console.log(typeof firstarg);
						throw `Argument given \`${firstarg}\` is not of type ${arg.typeof}`;
					}

					fixargs.set(arg.name, {
						name: arg.name,
						type: typeof firstarg,
						value: args
					});
				}
			}
		}
		console.log(fixargs);
		let hook: Webhook;
		if (msg.channel.type === 'text') {
			try {
				hook = await this.loadHook(msg);
			} catch (e) {
				console.error(e);
				hook = null;
			}
		} else {
			hook = null;
		}
		let guildSettings: GuildSettings;
		if (msg.channel.type !== 'dm') {
			guildSettings = this.db.guilds.get(msg.guild.id);
		} else {
			guildSettings = null;
		}

		return cmd.handler(this, msg, hook, fixargs, {
			cmd,
			guildSettings,
			userSettings: this.db.users.get(msg.author.id),
			calledAt: seq
		});

		// return cmd.handler(this, msg, args);
	}

	parseMessage(msg: Message): ParserRes {
		if (msg.author.id === this.client.user.id) {
			return {
				status: false,
				code: 403,
				type: 'self'
			};
		}

		if (msg.author.bot) {
			return {
				status: false,
				code: 403,
				type: 'bot'
			};
		}
		let { prefix } = this;
		if (msg.channel.type === 'text') {
			const guildPrefix = this.db.guilds.get(msg.guild.id).prefix;
			if (typeof guildPrefix !== 'undefined') {
				// eslint-disable-next-line prefer-destructuring
				prefix = this.db.guilds.get(msg.guild.id).prefix;
			}
		}


		if (!msg.content.startsWith(`<@!${this.client.user.id}> `) && !msg.content.startsWith(`${prefix}`)) {
			// console.log(msg.content);
			return {
				status: false,
				code: 403,
				type: 'no-match'
			};
		}

		if (msg.content === prefix || msg.content === `<@!${this.client.user.id}>`) {
			return {
				status: false,
				code: 403,
				type: 'no-match'
			};
		}

		let starter = prefix;
		if (msg.content.startsWith(`<@!${this.client.user.id}> `)) {
			starter = `<@!${this.client.user.id}> `;
		}
		console.log(JSON.stringify({ starter }));

		let afterstarter = msg.content.substring(starter.length, msg.content.length);
		const cmdbreak = afterstarter.indexOf(' ');
		let cmd: string;
		if (cmdbreak === -1) {
			cmd = afterstarter;
		} else {
			cmd = afterstarter.substring(0, cmdbreak);
		}

		afterstarter = afterstarter.substring(cmd.length, afterstarter.length).trim();
		console.log(afterstarter);

		if (!(/^[\w]+$/g).test(cmd)) {
			return {
				status: false,
				code: 400,
				type: 'no-match'
			};
		}

		/*
		 * return { status: true,
		 * 	code: 200,
		 * 	type: 'cmd',
		 * 	cmd,
		 * 	args: this.parseArgs(afterstarter) };
		 */
		let parsed: string[];

		try {
			parsed = this.parseArgs(afterstarter);
		} catch (e) {
			return {
				status: false,
				code: 400,
				type: 'parsing-error',
				message: e
			};
		}


		return {
			status: true,
			code: 200,
			type: 'cmd',
			cmd,
			args: parsed
		};
	}

	parseArgs(str: string): string[] {
		const parsed = [];
		let opened = false;

		const opens = [ '"', '\'', '“', '`' ];
		const closes = [ '"', '\'', '”', '`' ];
		let found = '';
		let processed = 0;
		let opener_char = '';
		const resolveOC = (opener: string) => {
			if (opens.includes(opener)) {
				if (opener === '“') {
					return '”';
				}
				return closes.find(o => o === opener);
			}
			return null;
		};
		const fixNumbers = (found: string) => {
			console.log(typeof found, found);
			if (found.includes('Infinity')) {
				return found;
			}
			if (!isNaN(found as unknown as number)) {
				if (!Number.isSafeInteger(found)) {
					let int: number | BigInt;
					try {
						int = BigInt(found);
					} catch (e) {
						return Number(found);
					}
					return int;
				}
				return Number(found);
			}
			if (found === 'true' || found === 'false') {
				return found === 'true';
			}
			return found;
		};
		for (const i in str as any) {
			const char = str[i];
			if (!opened) {
				if (opens.includes(char)) {
					opened = true;
					opener_char = char;
				}

				if (char === ' ') {
					console.log('fuck');
					if (found.trim() !== '') {
						parsed.push(fixNumbers(found));
					}
					found = '';
				} else if (str.length - 1 === processed) {
					found += char;
					console.log('ending');
					parsed.push(fixNumbers(found));
					found = '';
				} else {
					found += char;
				}
			} else {
				if (closes.includes(char)) {
					if (resolveOC(opener_char) === char) {
						found += char;
						opened = false;
						opener_char = '';
						parsed.push(found);
						found = '';
					}
				} else {
					found += char;
				}
			}


			console.log(str.length - 1, processed);
			console.log(char, opened, found, processed);


			console.log(parsed);


			processed++;
		}

		if (opener_char.length > 0) {
			throw `You forgot to close the character ${opener_char}!`;
		}

		return parsed;
	}
}

export default Kodachi;
export { Command, Plugin, JSONProvider, DBProvider };
export * from 'discord.js';
