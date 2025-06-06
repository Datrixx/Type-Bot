import { Message, Client, TextChannel, EmbedBuilder } from "discord.js";
import { getMusicChannel, getMusicPanelMessageId, setMusicPanelMessageId } from "./guildConfig.js";
import { getGuildConfig } from "./guildConfig.js"; // si es necesario

let panelMessages: Record<string, Message> = {};

export async function savePanelMessage(message: Message) {
  const guildId = message.guildId;
  if (!guildId) return;
  panelMessages[guildId] = message;
  await setMusicPanelMessageId(guildId, message.id);
}

export async function restorePanelMessage(client: Client) {
  const config = await getGuildConfig();

  for (const guildId of Object.keys(config)) {
    const musicChannelId = config[guildId]?.music?.musicChannelId;
    const messageId = config[guildId]?.music?.messageId;

    if (!musicChannelId || !messageId) continue;

    try {
      const channel = await client.channels.fetch(musicChannelId);
      if (!channel?.isTextBased()) continue;

      const msg = await (channel as TextChannel).messages.fetch(messageId);
      panelMessages[guildId] = msg;
      console.log(`✅ Panel restaurado en ${guildId}`);
    } catch (error) {
      console.warn(`⚠️ No se pudo restaurar el panel de ${guildId}:`, error);
    }
  }
}

export async function updatePanelEmbed(guildId: string, embed: EmbedBuilder) {
  const message = panelMessages[guildId];
  if (!message) {
    console.warn(`⚠️ No hay panel registrado para ${guildId}`);
    return;
  }

  try {
    await message.edit({ embeds: [embed] });
  } catch (error) {
    console.error(`❌ No se pudo actualizar el panel de ${guildId}:`, error);
  }
}
