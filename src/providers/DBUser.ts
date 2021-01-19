import DBProvider from './DBProvider';

export interface UserSettingsData {
	prefix?: string
}

export default class UserSettings {
	db: DBProvider
	// eslint-disable-next-line no-undef
	private rawdata: UserSettingsData
	constructor(user: UserSettingsData, db: DBProvider) {
		Object.defineProperty(this, 'db', {
			value: db,
			configurable: true,
			writable: true
		});
		Object.defineProperty(this, 'rawdata', {
			value: user,
			configurable: true,
			writable: true
		});
	}
}
