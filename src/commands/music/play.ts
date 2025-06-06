import { Discord, Slash, SlashOption } from "discordx";
import {
  CommandInteraction,
  GuildMember,
  ApplicationCommandOptionType,
  ChannelType,
} from "discord.js";
import { getMusicPlayer } from "./player.js";
import { defragmentPlaylist } from "../../utils/defragmentPlaylist.js";
import { getMusicChannel } from "../../utils/guildConfig.js";
import { createEmbed, EmbedColor } from "../../utils/createEmbed.js";

@Discord()
export class PlayCommand {
  @Slash({ name: "play", description: "Reproduce música en un canal de voz" })
  async play(
    @SlashOption({
      name: "query",
      description: "Nombre o URL de la canción o playlist",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    query: string,
    interaction: CommandInteraction
  ) {
    if (!interaction.guild) {
      await interaction.reply("❌ Este comando solo puede usarse en servidores.");
      return;
    }

    const allowedChannelId = await getMusicChannel(interaction.guildId!);
    if (interaction.channelId !== allowedChannelId) {
      return interaction.reply({
        content: `❌ Este comando solo puede usarse en el canal de música configurado. Utilice /setupmusic de ${interaction.client.user} para configurarlo.`,
        ephemeral: true,
      });
    }

    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
      const msg = await interaction.reply("❌ Debes estar en un canal de voz para usar este comando.");
      setTimeout(() => msg.delete().catch(() => {}), 2000);
      return;
    }

    const musicPlayer = getMusicPlayer();

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }

    const queue = musicPlayer.nodes.create(interaction.guild as any, {
      metadata: {
        channel: interaction.channel,
      },
    });

    try {
      if (!queue.connection) await queue.connect(voiceChannel as any);
    } catch {
      queue.delete();
      const replyMessage = await interaction.editReply("❌ No se pudo unir al canal de voz.");
      setTimeout(() => replyMessage.delete().catch(() => {}), 2000);
      return;
    }

    const tracks = await defragmentPlaylist(query, musicPlayer);

    if (tracks && tracks.length > 0) {
      for (const track of tracks) {
        track.requestedBy = interaction.user;
        queue.addTrack(track);
      }

      if (!queue.isPlaying()) await queue.node.play();

      const replyMessage = await interaction.editReply(
        `🎶 Se añadieron **${tracks.length} canciones** a la cola.`
      );
      setTimeout(() => replyMessage.delete().catch(() => {}), 2000);
      return;
    }

    const track = await musicPlayer.search(query, {
      requestedBy: interaction.user as any,
    }).then(x => x.tracks[0]);

    if (!track) {
      const replyMessage = await interaction.editReply("❌ No se encontró ninguna canción.");
      setTimeout(() => replyMessage.delete().catch(() => {}), 2000);
      return;
    }

    queue.addTrack(track);

    if (!queue.isPlaying()) await queue.node.play();

    const embed = createEmbed({
      title: "Now Playing",
      description: `[${track.title}](${track.url})`,
      color: "#00aae4",
      timestamp: true,
    });

    const sentMessage = await interaction.editReply({ embeds: [embed] });

    setTimeout(() => { interaction.deleteReply().catch(() => {}); }, 2000);
  }
}
