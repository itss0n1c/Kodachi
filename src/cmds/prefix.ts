import { Command } from '..';

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
	]
});

prefixCommand.run((bot, msg, args) => {
	if (!msg.member.hasPermission('ADMINISTRATOR')) {
		throw 'You\'re not a guild administrator!';
	}
	const prefix = args.get('prefix').value;
	if (typeof prefix === 'undefined' || !prefix.length) {
		return 'Missing prefix name';
	}

	try {
		bot.db.guilds.get(msg.guild.id).prefix = prefix;
	} catch (e) {
		console.log(e);
		throw 'Failed to update prefix!';
	}

	return 'Prefix updated.';
});

export default prefixCommand;
