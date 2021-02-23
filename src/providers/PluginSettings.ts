import BaseStore from './BaseStore';
import GuildSettings from './DBGuild';

export interface PluginExported {
	name: string
	enabled: boolean
}

export class PluginSettings extends BaseStore<string, boolean> {
	private gs: GuildSettings
	constructor(gs: GuildSettings, plugins: PluginExported[]) {
		super();
		Object.defineProperty(this, 'gs', {
			value: gs,
			configurable: true,
			writable: true
		});
		if (typeof plugins !== 'undefined') {
			this.init(plugins);
		}
	}

	init(plugins: PluginExported[]): void {
		console.log(`Found plugin settings for guild ${this.gs.id}`);
		for (const plugin of plugins) {
			super.set(plugin.name, plugin.enabled);
		}
	}

	eArray(): PluginExported[] {
		const arr: PluginExported[] = [];
		this.clearArray();

		for (const k of Object.keys(this.keyArray())) {
			arr.push({
				name: k,
				enabled: this.get(k)
			});
		}

		return arr;
	}

	set(k: string, v: boolean): this {
		super.set(k, v);
		//	this.gs.plugins = this.eArray();
		this.gs.set('plugins', this.eArray());
		// this.gs.db.update();
		return this;
	}
}
