import { existsSync, readFileSync, writeFileSync } from 'fs';
import DBProvider from './DBProvider';
import { Collection, Guild, User } from 'discord.js';
import UserSettings from './DBUser';
import GuildSettings, { GuildSettingsData } from './DBGuild';

interface JSONDBData {
	users: {
		[user: string]: any
	}
	guilds: {
		[guild: string]: GuildSettingsData
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
			this.guilds.set(guild.id, new GuildSettings({ id: guild.id }, this));
		}

		const data: JSONDBData = JSON.parse(readFileSync(this.path, { encoding: 'utf-8' }));
		for (const id of Object.keys(data.users)) {
			const user = data.users[id];
			this.users.set(id, new UserSettings(user, this));
		}
		for (const id of Object.keys(data.guilds)) {
			const guild = data.guilds[id];
			this.guilds.set(id, new GuildSettings({ ...guild,
				id: this.guilds.get(id).id }, this));
		}
	}

	update(): void {
		// console.log(this.guilds.get('802950865291968582'));
		const data: JSONDBData = {
			users: this.users.keyArray(),
			guilds: this.guilds.keyArray()
		};

		const notempty: JSONDBData = {
			users: {},
			guilds: {}
		};

		for (const id of Object.keys(data.guilds)) {
			const guild = data.guilds[id];
			if (Object.keys(guild).length > 0) {
				notempty.guilds[id] = guild;
			}
		}

		for (const id of Object.keys(data.users)) {
			const user = data.users[id];
			if (Object.keys(user).length > 0) {
				notempty.users[id] = user;
			}
		}

		// console.log(data.guilds);
		writeFileSync(this.path, JSON.stringify(notempty, null, 4), { encoding: 'utf-8' });
	}
}
