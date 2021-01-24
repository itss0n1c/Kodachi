/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseStore from './BaseStore';
import GuildSettings from './DBGuild';
import UserSettings from './DBUser';


export default class DBProvider {
	users: BaseStore<string, UserSettings>
	guilds: BaseStore<string, GuildSettings>
	constructor() {
		this.users = new BaseStore<string, UserSettings>();
		this.guilds = new BaseStore<string, GuildSettings>();
	}

	update(): void {
		throw 'Update function not implemented.';
	}

	init(...args: any[]): void {
		throw 'Init function not implemented.';
	}
}
