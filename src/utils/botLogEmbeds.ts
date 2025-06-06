import { EmbedBuilder } from "discord.js";
import { EmbedColor } from "./createEmbed.js";

export function createBotLogEmbed(userId: string, command: string, details?: string) {
    return new EmbedBuilder()
        .setTitle("Acción del Bot")
        .setDescription(
            `👤 Usuario: <@${userId}>\n🛠️ Comando: \`${command}\`${details ? `\n📝 Detalles: ${details}` : ""}`
        )
        .setColor(EmbedColor.INFO)
        .setTimestamp();
}