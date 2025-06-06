import { Discord, Slash } from "discordx";
import { CommandInteraction, GuildMember, ChannelType, ButtonInteraction } from "discord.js";
import { getMusicPlayer } from "./player.js";
import { getMusicChannel } from "../../utils/guildConfig.js";

@Discord()
export class StopCommand {
  @Slash({ name: "stop", description: "Detiene la música y sale del canal de voz" })
  async stop(interaction: CommandInteraction) {
    await this.doStop(interaction);
  }

  // Método nuevo para interacción de botón
  public async doStop(interaction: CommandInteraction | ButtonInteraction) {
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
    const queue = musicPlayer.nodes.get(interaction.guild.id);

    if (!queue || !queue.isPlaying()) {
      const reply = await interaction.reply({ content: "❌ No hay música reproduciéndose.", fetchReply: true });
      setTimeout(() => reply.delete().catch(() => {}), 2000);
      return;
    }

    queue.delete();

    const reply = await interaction.reply({ content: "⏹️ La música se ha detenido y el bot ha salido del canal de voz.", fetchReply: true });
    setTimeout(() => reply.delete().catch(() => {}), 2000);
  }
}
