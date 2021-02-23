import { Command } from '../../../Command';

const echoCommand = new Command({
	name: 'echo',
	ownerOnly: false,
	description: 'Joins multiple arguments into a single string',
	arguments: [
		{
			name: 'str',
			unlimited: true,
			typeof: 'any',
			optional: false
		}
	]
});

echoCommand.run((bot, msg, args) => args.get('str').value.join(' '));

export default echoCommand;
