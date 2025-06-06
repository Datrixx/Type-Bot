import {
  CommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} from "discord.js";
import { Discord, Slash } from "discordx";
import { setMusicChannel } from "../../utils/guildConfig.js";
import { savePanelMessage, updatePanelEmbed } from "../../utils/musicPanelManager.js";
import { getMusicPlayer } from "../music/player.js"; // Ajusta ruta si es necesario

@Discord()
export class SetupMusic {
  @Slash({
    name: "setupmusic",
    description: "Configura el canal de música con un panel de control.",
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

    await setMusicChannel(interaction.guild.id, interaction.channel.id);

    // Embed inicial con función que genera embed dinámico
    const embed = await generateMusicPanelEmbed(interaction.guild.id);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("music_prev")
        .setEmoji("⏪")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("music_stop")
        .setEmoji("🚫")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("music_next")
        .setEmoji("⏭️")
        .setStyle(ButtonStyle.Primary)
    );

    const reply = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    // Guardamos el mensaje para editarlo luego
    await savePanelMessage(reply);
  }
}

// Función para generar el embed dinámico con la cola actual
export async function generateMusicPanelEmbed(guildId: string) {
  const musicPlayer = getMusicPlayer();
  const queue = musicPlayer.nodes.get(guildId as any);

  const embed = new EmbedBuilder()
    .setTitle("🎶 Panel de Música")
    .setColor("Purple")
    .setFooter({ text: "TypeBot • Panel de música en tiempo real" })
    .setTimestamp();

  if (!queue || !queue.isPlaying()) {
    embed.setDescription("🔇 No hay ninguna canción reproduciéndose.");
    return embed;
  }

  const currentTrack = queue.currentTrack as any;
  const tracks = queue.tracks.toArray();

  embed.setDescription(`▶️ **Reproduciendo ahora:** [${currentTrack.title}](${currentTrack.url})`);

  if (currentTrack.thumbnail) {
    embed.setThumbnail(currentTrack.thumbnail);
  }

  if (tracks.length > 0) {
    const queueList = tracks
      .slice(0, 5)
      .map((track, index) => `\`${index + 1}.\` [${track.title}](${track.url})`)
      .join("\n");

    embed.addFields({
      name: `📜 Cola (${tracks.length} en total)`,
      value: queueList,
    });

    if (tracks.length > 5) {
      embed.addFields({
        name: "➕ Más canciones...",
        value: `Y ${tracks.length - 5} canciones más en la cola.`,
      });
    }
  } else {
    embed.addFields({
      name: "📜 Cola",
      value: "No hay canciones en la cola.",
    });
  }

  return embed;
}
