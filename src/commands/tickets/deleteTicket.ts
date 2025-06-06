import {
  CommandInteraction,
  ChannelType,
  PermissionsBitField,
  GuildMember,
  ButtonInteraction,
} from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export class DeleteTicketCommand {
  @Slash({
    name: "deleteticket",
    description: "Borra el canal del ticket actual.",
  })

  async close(interaction: CommandInteraction) {
    await this.doClose(interaction);
  }

  async doClose(interaction: CommandInteraction | ButtonInteraction) {
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
    const replyMessage = await interaction.editReply({
      content: "✅ El ticket se eliminará en 3 segundos...",
    });

    for (let i = 2; i >= 0; i--) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await interaction.editReply({
        content: `✅ El ticket se eliminará en ${i} segundos...`,
      });
    }

    await channel.delete();
    } catch (error) {
      console.error("Error al intentar borrar el ticket:", error);
      await interaction.editReply({
        content: "❌ Ocurrió un error al intentar borrar el ticket.",
      });
    }
  }
}
