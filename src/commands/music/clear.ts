import { Discord, Slash } from "discordx";
import {
  CommandInteraction,
  GuildMember,
  ChannelType,
} from "discord.js";
import { getMusicPlayer } from "./player.js";
import { getMusicChannel } from "../../utils/guildConfig.js";
import { generateMusicPanelEmbed } from "./setup.js";
import { updatePanelEmbed } from "../../utils/musicPanelManager.js";

@Discord()
export class ClearCommand {
  @Slash({ name: "clear", description: "Elimina todas las canciones en la cola" })
  async clear(interaction: CommandInteraction) {
    if (!interaction.guild) {
      const replyMessage = await interaction.reply({ content: "❌ Este comando solo puede usarse en servidores.", fetchReply: true });
      setTimeout(() => replyMessage.delete().catch(() => {}), 2000);
      return;
    }

    const allowedChannelId = await getMusicChannel(interaction.guildId!);
    if (interaction.channelId !== allowedChannelId) {
      const replyMessage = await interaction.reply({
        content: "❌ Este comando solo puede usarse en el canal de música configurado.",
        ephemeral: false,
        fetchReply: true,
      });
      setTimeout(() => replyMessage.delete().catch(() => {}), 2000);
      return;
    }

    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
      const replyMessage = await interaction.reply({ content: "❌ Debes estar en un canal de voz para usar este comando.", fetchReply: true });
      setTimeout(() => replyMessage.delete().catch(() => {}), 2000);
      return;
    }

    const musicPlayer = getMusicPlayer();
    const queue = musicPlayer.nodes.get(interaction.guild as any);

    if (!queue || !queue.isPlaying()) {
      const replyMessage = await interaction.reply({ content: "❌ No hay ninguna cola activa o canción reproduciéndose.", fetchReply: true });
      setTimeout(() => replyMessage.delete().catch(() => {}), 2000);
      return;
    }

    queue.tracks.clear();

    const embed = await generateMusicPanelEmbed(interaction.guildId!);
    await updatePanelEmbed(interaction.guildId!, embed);

    const replyMessage = await interaction.reply({ content: "🧹 La cola ha sido vaciada.", fetchReply: true });
    setTimeout(() => replyMessage.delete().catch(() => {}), 2000);
  }
}
