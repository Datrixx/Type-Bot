import { getMusicPlayer } from "../commands/music/player.js";
import { updatePanelEmbed } from "./musicPanelManager.js";
import { generateMusicPanelEmbed } from "../commands/music/setup.js";

// Importamos los tipos si usas discord-player u otro tipo definido
import { GuildQueue, Track } from "discord-player"; // asegúrate que sea correcto según tu lib

export function setupMusicEventHandlers() {
  const musicPlayer = getMusicPlayer();

  musicPlayer.events.on("playerStart", async (queue: GuildQueue<any>, track: Track) => {
    const embed = await generateMusicPanelEmbed(queue.guild.id);
    await updatePanelEmbed(queue.guild.id, embed);
  });

  musicPlayer.events.on("audioTrackAdd", async (queue: GuildQueue<any>, track: Track) => {
    const embed = await generateMusicPanelEmbed(queue.guild.id);
    await updatePanelEmbed(queue.guild.id, embed);
  });

  musicPlayer.events.on("audioTracksAdd", async (queue: GuildQueue<any>, tracks: Track[]) => {
    console.log("🎶 Playlist añadida, actualizando panel...");
    const embed = await generateMusicPanelEmbed(queue.guild.id);
    await updatePanelEmbed(queue.guild.id, embed);
    });

  musicPlayer.events.on("audioTracksRemove", async (queue: GuildQueue<any>) => {
    const embed = await generateMusicPanelEmbed(queue.guild.id);
    await updatePanelEmbed(queue.guild.id, embed);
  });

  musicPlayer.events.on("playerError", async (queue: GuildQueue<any>, error: Error) => {
    const embed = await generateMusicPanelEmbed(queue.guild.id);
    await updatePanelEmbed(queue.guild.id, embed);
  });

  musicPlayer.events.on("emptyQueue", async (queue) => {
    const embed = await generateMusicPanelEmbed(queue.guild.id);
    await updatePanelEmbed(queue.guild.id, embed);
  });

  musicPlayer.events.on("disconnect", async (queue) => {
    const embed = await generateMusicPanelEmbed(queue.guild.id);
    await updatePanelEmbed(queue.guild.id, embed);
  });

    musicPlayer.events.on("connectionDestroyed", async (queue) => {
    const embed = await generateMusicPanelEmbed(queue.guild.id);
    await updatePanelEmbed(queue.guild.id, embed);
    });
}
