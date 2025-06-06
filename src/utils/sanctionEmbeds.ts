import { EmbedBuilder } from "discord.js";
import { EmbedColor } from "./createEmbed.js";

export function createSanctionLogEmbed(
    moderatorId: string,
    userId: string,
    action: string,
    reason?: string
) {
    return new EmbedBuilder()
        .setTitle("Sanción aplicada")
        .setDescription(
            `👮‍♂️ Moderador: <@${moderatorId}>\n👤 Usuario: <@${userId}>\n✏️ Acción: ${action}${reason ? `\n📝 Razón: ${reason}` : ""}`
        )
        .setColor(EmbedColor.WARNING)
        .setTimestamp();
}