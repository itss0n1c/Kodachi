import { existsSync, readFileSync, writeFileSync } from 'fs';
import DBProvider from './DBProvider';
import { Collection, Guild, User } from 'discord.js';
import UserSettings from './DBUser';
import GuildSettings from './DBGuild';

interface JSONDBData {
	users: {
		[user: string]: any
	}
	guilds: {
		[guild: string]: any
	}
}

export default class JSONProvider extends DBProvider {
	path: string
	constructor(path: string, users: Collection<string, User>, guilds: Collection<string, Guild>) {
		super();
		this.path = path;
		console.log(this.path);
		this.init({ users,
			guilds });
	}

	init(collections: {users: Collection<string, User>, guilds: Collection<string, Guild>}): void {
		if (!existsSync(this.path)) {
			throw 'Path does not exist!';
		}

		for (const user of collections.users.array()) {
			this.users.set(user.id, new UserSettings({}, this));
		}

		for (const guild of collections.guilds.array()) {
			this.guilds.set(guild.id, new GuildSettings({}, this));
		}

		const data: JSONDBData = JSON.parse(readFileSync(this.path, { encoding: 'utf-8' }));
		for (const id of Object.keys(data.users)) {
			const user = data.users[id];
			this.users.set(id, new UserSettings(user, this));
		}
		for (const id of Object.keys(data.guilds)) {
			const guild = data.guilds[id];
			this.guilds.set(id, new GuildSettings(guild, this));
		}
	}

	update(): void {
		const data: JSONDBData = {
			users: this.users.keyArray(),
			guilds: this.guilds.keyArray()
		};
		writeFileSync(this.path, JSON.stringify(data, null, 4), { encoding: 'utf-8' });
	}
}
