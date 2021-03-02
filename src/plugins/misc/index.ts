import { Plugin } from '../../Plugin';
import echoCommand from './cmds/echo';
import helpCommand from './cmds/help';
import pingCommand from './cmds/ping';
import typeofCommand from './cmds/typeof';

export default function(customHelp = false): Plugin {
	const cmds = [ echoCommand, typeofCommand, pingCommand ];
	if (!customHelp) {
		cmds.push(helpCommand);
	}
	return new Plugin({
		name: 'misc',
		description: 'Collection of basic built in commands',
		commands: cmds
	});
}
