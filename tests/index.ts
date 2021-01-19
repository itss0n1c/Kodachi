import { config } from 'dotenv';
import { DiscordTS } from '../src';

config();

new DiscordTS(process.env.TOKEN, {
	prefix: '/',
	owners: [ '211160171945263105' ],
	commands: []
});
