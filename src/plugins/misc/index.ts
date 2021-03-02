import { Plugin } from '../../Plugin';
import echoCommand from './cmds/echo';
import helpCommand from './cmds/help';
import pingCommand from './cmds/ping';
import typeofCommand from './cmds/typeof';

const miscPlugin = new Plugin({
	name: 'misc',
	description: 'Collection of basic built in commands',
	commands: [ echoCommand, typeofCommand, helpCommand, pingCommand ]
});

export default miscPlugin;
