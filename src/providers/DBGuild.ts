/* eslint-disable no-undef */
import DBProvider from './DBProvider';
import { PluginExported, PluginSettings } from './PluginSettings';


export interface GuildSettingsData {
	id?: string
	prefix?: string
	plugins?: PluginExported[]
	[k: string]: any
}

export default class GuildSettings implements GuildSettingsData {
	id: string
	db: DBProvider
	prefix: string
	ps: PluginSettings
	plugins: PluginExported[];
	[k: string]: any

	constructor(guild: GuildSettingsData, db: DBProvider) {
		// console.log(guild);
		Object.defineProperty(this, 'db', {
			value: db,
			configurable: true,
			writable: true
		});

		Object.defineProperty(this, 'id', {
			value: guild.id,
			configurable: true,
			writable: true
		});


		for (const k of Object.keys(guild)) {
			this[k] = guild[k];
		}

		Object.defineProperty(this, 'ps', {
			value: new PluginSettings(this, this.plugins),
			configurable: true,
			writable: true
		});
	}

	set(k: string, v: unknown): this {
		if (typeof this[k] === 'undefined' || this[k] !== v) {
			this[k] = v;
			console.log(k, v);
			console.log('saving to db');
			this.db.update();
			return this;
		}
		console.log('BLAH', k, v);
		this[k] = v;
		return this;
	}
}
