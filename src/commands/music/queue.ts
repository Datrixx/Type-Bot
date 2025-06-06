import { Discord, Slash } from "discordx";
import { CommandInteraction, GuildMember, ChannelType } from "discord.js";
import { getMusicPlayer } from "./player.js";
import { createEmbed, EmbedColor } from "../../utils/createEmbed.js";

@Discord()
export class QueueCommand {
  @Slash({ name: "queue", description: "Muestra la lista de canciones en cola" })
  async queue(interaction: CommandInteraction): Promise<void> {
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

    const tracks = queue.tracks.toArray();

    if (tracks.length === 0) {
      const reply = await interaction.reply({ content: "🎶 No hay canciones en la cola.", fetchReply: true });
      setTimeout(() => reply.delete().catch(() => {}), 2000);
      return;
    }

    const description = tracks
      .slice(0, 10)
      .map((track, i) => `\`${i + 1}.\` [${track.title}](${track.url}) - \`${track.duration}\``)
      .join("\n");

    const embed = createEmbed({
      title: "📜 Cola de reproducción",
      description,
      color: EmbedColor.INFO,
      footer: { text: `Mostrando ${Math.min(tracks.length, 10)} de ${tracks.length} canciones en cola.` },
      timestamp: true,
    });

    const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
    setTimeout(() => reply.delete().catch(() => {}), 2000);
  }
}
