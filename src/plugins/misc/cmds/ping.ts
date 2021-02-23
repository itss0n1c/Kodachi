import { Command } from '../../../Command';


const pingCommand = new Command({
	name: 'ping',
	description: 'Ping the bot',
	ownerOnly: false,
	arguments: []
});

pingCommand.run(async (bot, msg) => `🏓 Latency is ${Date.now() - msg.createdTimestamp}ms. API Latency is ${Math.round(bot.client.ws.ping)}ms`);

export default pingCommand;
