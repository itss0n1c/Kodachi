import { Command } from '../../../Command';

const enableCommand = new Command({
	name: 'enable',
	description: 'Enables a plugin on a server',
	arguments: [
		{
			name: 'plugin',
			unlimited: false,
			optional: false,
			typeof: 'string'
		}
	],
	ownerOnly: false,
	hasPerm: [ 'MANAGE_GUILD' ]
});

enableCommand.run((bot, msg, args, env) => {
	if (typeof args.get('plugin') === 'undefined') {
		throw 'Plugin name required.';
	}
	const plugin_name = args.get('plugin').value[0];
	if (!bot.plugins.has(plugin_name)) {
		throw 'Can\'t find that plugin.';
	}
	const plugin = bot.plugins.get(plugin_name);
	if (plugin.name === env.cmd.plugin.name) {
		throw 'Can\'t do operations on the defaults plugin.';
	}

	console.log(env.guildSettings.ps);

	if (env.guildSettings.ps.has(plugin.name)) {
		if (env.guildSettings.ps.get(plugin.name)) {
			throw `Plugin \`${plugin.name}\` already enabled.`;
		}
	}

	env.guildSettings.ps.set(plugin.name, true);

	if (env.guildSettings.ps.get(plugin.name)) {
		return `**Enabled** the \`${plugin.name}\` plugin.`;
	}
	console.log(env.guildSettings.ps);
	throw `Failed to enable the \`${plugin.name}\` plugin`;
});

export default enableCommand;
