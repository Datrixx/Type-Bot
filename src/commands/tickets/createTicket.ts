import {
  CommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ButtonInteraction,
  PermissionsBitField,
} from "discord.js";
import { Discord, Slash } from "discordx";
import { getTicketCount, incrementTicketCount } from "../../utils/guildConfig.js"; // Asegúrate de tener este método
import { createEmbed } from "../../utils/createEmbed.js";

@Discord()
export class CreateTicket {
  @Slash({
    name: "createticket",
    description: "Crea un ticket para el soporte.",
  })
  async create(interaction: CommandInteraction ) {
    await this.doCreate(interaction);
  }

  public async doCreate(interaction: CommandInteraction | ButtonInteraction) {
    const guild = interaction.guild;
    if (!guild || !interaction.channel) return;

    const ticketCount = await getTicketCount(guild.id);
    const channelName = `ticket-${ticketCount + 1}`;

    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ],
    });

    await incrementTicketCount(guild.id);

    const ephemeralTicketReply = await interaction.reply({
      content: `🎟️ Se ha creado tu ticket: ${channel}`,
      ephemeral: true,
    });

    if (!ephemeralTicketReply) {
      console.error("No se pudo enviar la respuesta efímera.");
      return;
    }

    setTimeout(() => {
        ephemeralTicketReply.delete().catch(console.error);
    }, 2000);

    const embed = await createEmbed({
        title: "📩 Nuevo Ticket Creado",
        description:  `Hola <@${interaction.user.id}>, gracias por contactar con el soporte.\nUn miembro del equipo te atenderá en breve.`,
        color: 0x0099ff,
        timestamp: true,
    })

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(

        new ButtonBuilder()
            .setCustomId("ticket_save")
            .setLabel("Guardar Ticket")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("ticket_close")
            .setLabel("Cerrar Ticket")
            .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [embed],
      components: [row],
    });

  }
}
