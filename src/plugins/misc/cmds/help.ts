import { Command } from '../../../Command';
import { MessageEmbed, EmbedField } from 'discord.js';

const helpCommand = new Command({
	name: 'help',
	description: 'Give information on the commands/plugins that can be used.',
	ownerOnly: false,
	arguments: [
		{
			name: 'cmd',
			unlimited: false,
			optional: true,
			typeof: 'string'
		}
	]
});


helpCommand.run((bot, msg, args) => {
	if (typeof args.get('cmd') !== 'undefined') {
		const cmd_name = args.get('cmd').value[0];
		const plugin = bot.plugins.find(p => p.commands.has(cmd_name));
		if (typeof plugin === 'undefined') {
			throw 'Couldn\'t find that command!';
		}
		const cmd = plugin.commands.get(cmd_name);
		if (typeof cmd === 'undefined') {
			throw `Couldn't find the command \`${cmd_name}\``;
		}
		if (cmd.ownerOnly && !bot.owners.includes(msg.author.id)) {
			throw `Can't show information on the \`${cmd_name}\``;
		}
		const embed = new MessageEmbed()
			.setTitle(cmd.name)
			.setDescription(cmd.description);

		embed.fields = [
			{
				name: 'Owner Only',
				value: cmd.ownerOnly ? 'Yes' : 'No',
				inline: false
			},
			{
				name: 'Arguments',
				value: `\`\`\`js\n${JSON.stringify(cmd.arguments, null, 4)}\`\`\``,
				inline: false
			}
		];
		return embed;
	}


	const fields: EmbedField[] = [];

	for (const plugin of bot.plugins.array()) {
		let cmds = plugin.commands.array();
		if (!bot.owners.includes(msg.author.id)) {
			cmds = cmds.filter(c => !c.ownerOnly);
		}
		const cmd_names = cmds.map(c => c.name);
		console.log(cmds);
		fields.push({
			name: plugin.name,
			value: `${plugin.description}\n\`\`\`${cmd_names.join(' ')}\`\`\``,
			inline: false
		});
	}

	const embed = new MessageEmbed();
	embed.setTitle('Help')
		.setDescription('Information on plugins this bot has.')
		.setTimestamp(new Date())
		.setFooter(msg.author.tag, msg.author.displayAvatarURL({ format: 'png' }));
	embed.fields = fields;

	console.log(embed);
	return embed;
});

export default helpCommand;
