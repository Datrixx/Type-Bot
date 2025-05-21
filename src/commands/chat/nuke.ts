import { Discord, Slash, SlashOption } from "discordx";
import { ApplicationCommandOptionType, TextChannel, CommandInteraction } from "discord.js";
import { createEmbed, EmbedColor } from "../../utils/createEmbed.js";

@Discord()
export class Nuke {
    @Slash({ name: "nukechannel", description: "Nuke un canal" })
    async nukechannel(
        @SlashOption({ name: "channel", description: "Canal", type: ApplicationCommandOptionType.Channel, required: true })
        channel: TextChannel,
        @SlashOption({ name: "reason", description: "Razón", type: ApplicationCommandOptionType.String, required: false })
        reason?: string,
    ) {
        const ctxEmbed = createEmbed({
            title: `Canal ${channel.name} nukeado ⚒️`,
            description: `Razón: ${reason || "No se proporcionó razón"}`,
            color: EmbedColor.INFO,
        });

        await channel.send({ embeds: [ctxEmbed] });
        await channel.clone();
        await channel.delete();
    }

    @Slash({ name: "nuketext", description: "Elimina los últimos 20 mensajes de un canal de texto" })
    async nuketext(
        @SlashOption({ name: "channel", description: "Canal de texto", type: ApplicationCommandOptionType.Channel, required: true })
        channel: TextChannel,
        interaction: CommandInteraction
    ) {
        try {
            const messages = await channel.messages.fetch({ limit: 20 });
            await channel.bulkDelete(messages, true);

            const ctxEmbed = createEmbed({
                title: `Nuke de mensajes 💥`,
                description: `Se han eliminado los últimos 20 mensajes en <#${channel.id}>.`,
                color: EmbedColor.INFO,
            });

            await interaction.reply({ embeds: [ctxEmbed], ephemeral: true });
        } catch (error: any) {
            await interaction.reply({
                content: "❌ No se pudieron eliminar los mensajes. ¿Quizás son muy antiguos o no tengo permisos?",
                ephemeral: true,
            });
        }
    }
}