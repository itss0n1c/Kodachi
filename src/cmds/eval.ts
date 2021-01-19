import { Command } from '../Command';
import { inspect } from 'util';

const evalCommand = new Command({
	name: 'eval',
	ownerOnly: true,
	description: 'evaluate javascript',
	arguments: [
		{
			name: 'js',
			unlimited: true,
			typeof: 'string',
			optional: false
		}
	]
});

evalCommand.run(async (bot, msg, args) => {
	const js = args.get('js').value;
	if (typeof js === 'undefined' || !js.length) {
		return 'Missing js input to evaluate';
	}
	const script = js.join(' ');

	let run: string;
	try {
		run = await Object.getPrototypeOf((async () => '')).constructor('bot', 'msg', 'args', `return ${script}`)(bot, msg, args);
	} catch (e) {
		run = e;
	}

	return `Output:\n\`\`\`js\n${inspect(run, { depth: 0 })}\`\`\``;
});

export default evalCommand;
