import DBProvider from './DBProvider';

export interface GuildSettingsData {
	prefix?: string
}

export default class GuildSettings {
	db: DBProvider
	private rawdata: GuildSettingsData
	prefix: string
	constructor(guild: GuildSettingsData, db: DBProvider) {
		Object.defineProperty(this, 'db', {
			value: db,
			configurable: true,
			writable: true
		});
		Object.defineProperty(this, 'rawdata', {
			value: guild,
			configurable: true,
			writable: true
		});

		Object.defineProperty(this, 'prefix', {
			get: () => this.rawdata.prefix,
			set: (v: any) => {
				this.rawdata.prefix = v;
				db.update();
			},
			enumerable: true
		});
	}
}
