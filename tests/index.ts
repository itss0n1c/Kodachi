import { config } from 'dotenv';
import { DiscordTS } from '../src';
import { join } from 'path';


config();

new DiscordTS(process.env.TOKEN, {
	prefix: '!',
	owners: [ '211160171945263105' ],
	commands: [],
	db: join(__dirname, 'data.json')
});
