import {
  CommandInteraction,
  AttachmentBuilder,
  ChannelType,
  PermissionsBitField,
  GuildMember,
  ButtonInteraction,
} from "discord.js";
import { Discord, Slash } from "discordx";
import { generateTicketLog } from "../../utils/saveTicketLog.js"; // actualízalo según el nombre correcto

@Discord()
export class SaveTicketCommand {
  @Slash({
    name: "saveticket",
    description: "Guarda el historial de este ticket como un archivo de texto.",
  })
  async save(interaction: CommandInteraction) {
    await this.doSave(interaction);
  }

  async doSave(interaction: CommandInteraction | ButtonInteraction) {
    const channel = interaction.channel;

    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "❌ Este comando solo puede usarse en canales de texto.",
        ephemeral: true,
      });
    }

    if (!channel.name.startsWith("ticket-")) {
      return interaction.reply({
        content: "❌ Este canal no parece ser un canal de ticket.",
        ephemeral: true,
      });
    }

    if (!interaction.member) {
      return interaction.reply({
        content: "❌ No se pudo obtener la información del miembro.",
        ephemeral: true,
      });
    }

    const member = interaction.member as GuildMember;

    if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: "❌ No tienes permiso para usar este comando.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const buffer = await generateTicketLog(channel);
      const file = new AttachmentBuilder(buffer, {
        name: `${channel.name}_log.txt`,
      });

      await interaction.editReply({
        content: "✅ Ticket guardado correctamente:",
        files: [file],
      });
    } catch (error) {
      console.error("Error al guardar el ticket:", error);
      await interaction.editReply({
        content: "❌ Ocurrió un error al guardar el ticket.",
      });
    }
  }
}
