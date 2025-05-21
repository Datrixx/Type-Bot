import { Client, TextChannel, EmbedBuilder } from "discord.js";
import { getLogChannel } from "../../utils/guildConfig.js";

export class SanctionLogger {
    static async log(
        client: Client,
        guildId: string,
        embed: EmbedBuilder
    ) {
        const logChannelId = await getLogChannel(guildId);
        if (!logChannelId) {
            throw new Error("SanctionLogger: Debes ejecutar /sanctionlogsetup antes de usar log().");
        }
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(logChannelId);
        if (channel?.isTextBased()) {
            await (channel as TextChannel).send({ embeds: [embed] });
        }
    }
}