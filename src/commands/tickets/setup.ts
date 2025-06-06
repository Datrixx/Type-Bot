import {
  CommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Message,
} from "discord.js";
import { Discord, Slash } from "discordx";
import { setTicketChannel } from "../../utils/guildConfig.js";
import { createEmbed } from "../../utils/createEmbed.js";

@Discord()
export class SetupTickets {
    @Slash({
        name: "setuptickets",
        description: "Configura el canal de tickets con un panel de control.",
    })
    async setup(interaction: CommandInteraction) {
        if (!interaction.guild || !interaction.channel) return;
        if (interaction.channel.type !== ChannelType.GuildText) {
            const reply = await interaction.reply({
                content: "❌ Este comando solo puede usarse en un canal de texto.",
                ephemeral: true,
                fetchReply: true,
            });
            setTimeout(() => reply.delete().catch(() => {}), 2000);
            return;
        }

        await setTicketChannel(interaction.guild.id, interaction.channel.id);
        const embed = await generateTicketPanelEmbed(interaction.guild.id);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket_create")
                .setLabel("Crear Ticket")
                .setStyle(ButtonStyle.Primary)
        );

        const reply = await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true,
        });

        await savePanelMessage(reply);
    }


}

export async function generateTicketPanelEmbed(guildId: string){
    const embed = createEmbed({
        title: "Panel de Tickets🎫",
        description: "Aquí puedes gestionar los tickets del servidor.",
        color: 0x0099ff,
    });

    return embed;
}

let panelMessages: Record<string, Message> = {};

export async function savePanelMessage(message: Message) {
  const guildId = message.guildId;
  if (!guildId) return;
  panelMessages[guildId] = message;
  await setTicketChannel(guildId, message.id);
}
