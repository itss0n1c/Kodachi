import { config } from 'dotenv';
import Kodachi from '../src';
import randomShit from './plugins';


config();

new Kodachi(process.env.TOKEN, {
	prefix: 'k/',
	owners: [ '211160171945263105' ],
	plugins: [ randomShit ]
});

/*
 * bot.client.on('ready', async () => {
 *const channel = bot.client.channels.cache.find(c => (c as TextChannel).name === 's0n1c-bot') as TextChannel;
 *await channel.messages.fetch();
 *});
 *
 *
 *bot.client.on('message', async (msg) => {
 *if (msg.author.id === bot.client.user.id) {
 *return;
 *}
 *if (bot.owners.includes(msg.author.id)) {
 *return;
 *}
 *if ((msg.channel as TextChannel).name !== 's0n1c-bot') {
 *return;
 *}
 *await msg.delete();
 *});
 *
 *
 *bot.client.on('messageReactionAdd', async (message, user) => {
 *await message.remove();
 *});
 */
