import { Command } from '../../../Command';


const pingCommand = new Command({
	name: 'ping',
	description: 'Ping the bot',
	ownerOnly: false,
	arguments: []
});

pingCommand.run(async (bot, msg, args, env) => `🏓 Latency is ${env.calledAt - msg.createdTimestamp}ms. API Latency is ${Math.round(bot.client.ws.ping)}ms`);

export default pingCommand;
