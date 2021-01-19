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
}
