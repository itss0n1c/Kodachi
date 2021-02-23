import { Plugin } from '../../src';
import bruhCommand from './cmds/bruh';

const randomShit = new Plugin({
	name: 'randomshit',
	description: 'just a random plugin',
	commands: [ bruhCommand ]
});

export default randomShit;
