import { Discord, Slash } from "discordx";
import { CommandInteraction, GuildMember, ChannelType } from "discord.js";
import { getMusicPlayer } from "./player.js";
import { createEmbed, EmbedColor } from "../../utils/createEmbed.js";

@Discord()
export class NowPlayingCommand {
  @Slash({ name: "now", description: "Muestra la canción que se está reproduciendo actualmente" })
  async now(interaction: CommandInteraction): Promise<void> {
    if (!interaction.guild) {
      const reply = await interaction.reply({ content: "❌ Este comando solo puede usarse en servidores.", fetchReply: true });
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
      const reply = await interaction.reply({ content: "❌ Debes estar en el mismo canal de voz que el bot para usar este comando.", fetchReply: true });
      setTimeout(() => reply.delete().catch(() => {}), 2000);
      return;
    }

    const currentTrack = queue.currentTrack;
    if (!currentTrack) {
      const reply = await interaction.reply({ content: "❌ No hay ninguna canción reproduciéndose.", fetchReply: true });
      setTimeout(() => reply.delete().catch(() => {}), 2000);
      return;
    }

    function getYouTubeID(url: string): string | null {
      const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    }

    let thumbnail = currentTrack.thumbnail ?? null;
    if (!thumbnail) {
      const ytID = getYouTubeID(currentTrack.url);
      if (ytID) {
        thumbnail = `https://img.youtube.com/vi/${ytID}/hqdefault.jpg`;
      }
    }

    const title = currentTrack.title;
    const url = currentTrack.url;
    const requestedBy = currentTrack.requestedBy?.username ?? "Desconocido";
    const duration = currentTrack.duration;
    const views = currentTrack.views ? currentTrack.views.toLocaleString() : "N/A";

    const description = `**Duración:** \`${duration}\`\n**Vistas:** \`${views}\``;

    const embed = createEmbed({
      title,
      url,
      description,
      color: EmbedColor.INFO,
      thumbnail: thumbnail || undefined,
      footer: { text: `Solicitada por: ${requestedBy}` },
      timestamp: true,
    });

    const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
    setTimeout(() => reply.delete().catch(() => {}), 2000);
  }
}
