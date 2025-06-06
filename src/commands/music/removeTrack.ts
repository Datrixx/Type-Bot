import { Discord, Slash, SlashOption } from "discordx";
import {
  CommandInteraction,
  GuildMember,
  ChannelType,
  ApplicationCommandOptionType,
} from "discord.js";
import { getMusicPlayer } from "./player.js";
import { getMusicChannel } from "../../utils/guildConfig.js";
import { generateMusicPanelEmbed } from "./setup.js";
import { updatePanelEmbed } from "../../utils/musicPanelManager.js";

@Discord()
export class RemoveTrackCommand {
  @Slash({ name: "remove", description: "Elimina una canción específica de la cola" })
  async remove(
    @SlashOption({
      name: "posición",
      description: "Número de canción en la cola (1, 2, 3...)",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    })
    position: number,
    interaction: CommandInteraction
  ) {
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
    const queue = musicPlayer.nodes.get(interaction.guild! as any);

    if (!queue || !queue.isPlaying()) {
      const reply = await interaction.reply({ content: "❌ No hay ninguna cola activa o canción reproduciéndose.", fetchReply: true });
      setTimeout(() => reply.delete().catch(() => {}), 2000);
      return;
    }

    if (position < 1 || position > queue.tracks.size) {
      const reply = await interaction.reply({
        content: `❌ Posición inválida. Debes indicar un número entre 1 y ${queue.tracks.size}.`,
        fetchReply: true,
      });
      setTimeout(() => reply.delete().catch(() => {}), 2000);
      return;
    }

    const removedTrack = queue.tracks.toArray()[position - 1];
    queue.tracks.remove((_, i) => i === position - 1);

    const embed = await generateMusicPanelEmbed(interaction.guildId!);
    await updatePanelEmbed(interaction.guildId!, embed);

    const reply = await interaction.reply({
      content: `🗑️ Se eliminó **${removedTrack.title}** de la cola.`,
      fetchReply: true,
    });
    setTimeout(() => reply.delete().catch(() => {}), 2000);
  }
}
