import { Command } from '../../..';

const prefixCommand = new Command({
	name: 'prefix',
	description: 'Change the prefix in a guild',
	ownerOnly: false,
	arguments: [
		{
			name: 'prefix',
			optional: false,
			unlimited: false,
			typeof: 'string'
		}
	],
	hasPerm: [ 'MANAGE_GUILD' ]
});

prefixCommand.run((bot, msg, args, env) => {
	const prefixarg = args.get('prefix');
	if (typeof prefixarg === 'undefined' || !prefixarg.value.length) {
		const	guildPrefix = bot.db.guilds.get(msg.guild.id).prefix;
		let currentPrefix = bot.prefix;
		if (typeof guildPrefix !== 'undefined') {
			currentPrefix = guildPrefix || ' ';
		}
		let str = `The current prefix is \`${currentPrefix}\`\n\nThe global prefix is \`${bot.prefix}\` (or a message starting with ${bot.client.user}).`;
		if (!bot.db.dontSave) {
			str += `\nTo change the prefix, run \`${currentPrefix}prefix prefix_here\``;
		}
		return str;
	}
	if (!bot.db.dontSave) {
		let prefix: string = prefixarg.value[0].replace(/\s+/g, '');


		console.log('prefix', { prefix });
		const matches = [ '""', '\'\'', '``' ];
		if (matches.includes(prefix)) {
			prefix = '';
		}

		env.guildSettings.set('prefix', prefix);

		return `Prefix updated to \`${prefix || ' '}\`.`;
	}
	return 'Prefix can\'t be changed on this bot.';
});

export default prefixCommand;
