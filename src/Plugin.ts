import { PermissionString } from 'discord.js';
import { Command } from '.';
import BaseStore from './providers/BaseStore';
import DBProvider from './providers/DBProvider';

interface PluginData {
	name: string
	description: string
	commands: Command[]
	hasPerm?: PermissionString[]
	// db: DBProvider
}

export class Plugin {
	name: string
	description: string
	commands = new BaseStore<string, Command>()
	db: DBProvider
	hasPerm: PermissionString[] = []
	constructor(data: PluginData) {
		this.name = data.name;
		this.description = data.description;
		// this.db = db;
		if (typeof data.hasPerm !== 'undefined') {
			this.hasPerm = data.hasPerm;
		}
		this.initCmds(data.commands);
	}

	initCmds(cmds: Command[]): void {
		for (const cmd of cmds) {
			cmd.plugin = this;
			this.commands.set(cmd.name, cmd);
		}
	}
}

export class Plugins extends BaseStore<string, Plugin> {
	private db: DBProvider
	constructor(db: DBProvider) {
		super();
		Object.defineProperty(this, 'db', {
			value: db,
			configurable: true,
			writable: true
		});
	}

	set(k: string, v: Plugin): this {
		v.db = this.db;
		super.set(k, v);
		return this;
	}
}
