import { Command } from '../../..';

const typeofCommand = new Command({
	name: 'typeof',
	description: 'get the type of argument(s)',
	ownerOnly: false,
	arguments: [
		{
			name: 'args',
			unlimited: true,
			typeof: 'any',
			optional: false
		}
	]
});

typeofCommand.run((bot, msg, args) => {
	const types = [];
	for (const part of args.get('args').value) {
		types.push(`${part} (${typeof part})`);
	}
	return `\`\`\`${types.join('\n')}\`\`\``;
});

export default typeofCommand;
