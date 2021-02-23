import { Command } from '.';
import GuildSettings from './providers/DBGuild';
import UserSettings from './providers/DBUser';

export interface CmdEnv {
	cmd: Command
	guildSettings: GuildSettings
	userSettings: UserSettings
}
