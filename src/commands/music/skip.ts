import { Discord, Slash } from "discordx";
import { CommandInteraction, GuildMember, ChannelType, ButtonInteraction } from "discord.js";
import { getMusicPlayer } from "./player.js";
import { getMusicChannel } from "../../utils/guildConfig.js";

@Discord()
export class SkipCommand {
  @Slash({ name: "skip", description: "Salta la canción actual" })
  async skip(interaction: CommandInteraction): Promise<void> {
    await this.doSkip(interaction);
  }

  @Slash({ name: "next", description: "Alias para /skip - Salta la canción actual" })
  async next(interaction: CommandInteraction): Promise<void> {
    await this.doSkip(interaction);
  }


  /**
 * Ejecuta la acción de saltar canción.
 * Puede ser llamada tanto desde un comando slash como desde un botón.
 *
 * @param interaction - La interacción del usuario (comando o botón)
 */
  public async doSkip(interaction: CommandInteraction | ButtonInteraction): Promise<void> {

    if (!interaction.guild) {
      const reply = await interaction.reply({ content: "❌ Este comando solo puede usarse en servidores.", fetchReply: true });
      setTimeout(() => reply.delete().catch(() => {}), 2000);
      return;
    }

    const allowedChannelId = await getMusicChannel(interaction.guildId!);
    if (interaction.channelId !== allowedChannelId) {
      const reply = await interaction.reply({
        content: "❌ Este comando solo puede usarse en el canal de música configurado.",
        ephemeral: true,
        fetchReply: true,
      });
      setTimeout(() => reply.delete().catch(() => {}), 2000);
      return;
    }

    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
      const reply = await interaction.reply({ content: "❌ Debes estar en un canal de voz para usar este comando.", fetchReply: true });
      setTimeout(() => reply.delete().catch(() => {}), 2000);
      return;
    }

    const musicPlayer = getMusicPlayer();
    const queue = musicPlayer.nodes.get(interaction.guild as any);

    if (!queue || !queue.isPlaying()) {
      const reply = await interaction.reply({ content: "❌ No hay ninguna canción reproduciéndose.", fetchReply: true });
      setTimeout(() => reply.delete().catch(() => {}), 2000);
      return;
    }

    const botChannelId = (queue.connection as any)?.joinConfig?.channelId;
    if (botChannelId !== voiceChannel.id) {
      const reply = await interaction.reply({
        content: "❌ Debes estar en el mismo canal de voz que el bot para usar este comando.",
        fetchReply: true,
      });
      setTimeout(() => reply.delete().catch(() => {}), 2000);
      return;
    }

    const success = queue.node.skip();

    const reply = await interaction.reply({
      content: success ? "⏭️ Canción saltada." : "❌ No se pudo saltar la canción.",
      fetchReply: true,
    });
    setTimeout(() => reply.delete().catch(() => {}), 2000);
  }
}
