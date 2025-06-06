import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { getLogConfig } from "./guildConfig.js";

export type LogType = "bot" | "sanction" | "server";

export async function logAction(
  client: Client,
  guildId: string,
  embed: EmbedBuilder,
  type: LogType
) {
  try {
    const config = await getLogConfig(guildId);
    if (!config?.[type]?.enabled) return;
    const channelId = config[type]?.channelId;
    if (!channelId) return;
    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      await (channel as TextChannel).send({ embeds: [embed] });
    }
  } catch (error) {
    console.error(`[LOG] Error al enviar log de tipo ${type} en guild ${guildId}:`, error);
  }
}