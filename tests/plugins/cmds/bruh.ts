import { Command } from '../../../src';

const bruhCommand = new Command({
	name: 'bruh',
	description: 'says bruh',
	arguments: [],
	ownerOnly: false
});

bruhCommand.run(() => 'bruh.');

export default bruhCommand;
