import { Plugin } from '../../Plugin';
import disableCommand from './cmds/disable';
import enableCommand from './cmds/enable';
import evalCommand from './cmds/eval';
import prefixCommand from './cmds/prefix';

const defaultPlugin = new Plugin({
	name: 'defaults',
	description: 'The default commands',
	commands: [ evalCommand, prefixCommand, enableCommand, disableCommand ]
});

export default defaultPlugin;
