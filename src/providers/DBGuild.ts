/* eslint-disable no-undef */
import DBProvider from './DBProvider';

export interface GuildSettingsData {
	prefix?: string
	[k: string]: any
}

export default class GuildSettings implements GuildSettingsData {
	db: DBProvider
	prefix: string
	private rawdata: GuildSettingsData
	[k: string]: any

	constructor(guild: GuildSettingsData, db: DBProvider) {
		Object.defineProperty(this, 'db', {
			value: db,
			configurable: true,
			writable: true
		});

		const props: PropertyDescriptorMap & ThisType<any> = {};

		Object.defineProperty(this, 'rawdata', {
			value: guild,
			configurable: true,
			writable: true
		});


		for (const k of Object.keys(guild)) {
			props[k] = {
				get: () => this.rawdata[k],
				set: (v: any) => {
					this.rawdata.prefix = v;
					db.update();
				},
				enumerable: true
			};
		}

		Object.defineProperties(this, props);
	}
}
