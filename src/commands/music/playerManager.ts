import { Player } from "discord-player";
import type { Client } from "discordx";

const players = new Map<string, Player>();

export function getPlayerByVoiceChannel(voiceChannelId: string): Player | undefined {
  return players.get(voiceChannelId);
}

export function createPlayerForVoiceChannel(bot: any, voiceChannelId: string): Player {
  if (players.has(voiceChannelId)) {
    return players.get(voiceChannelId)!;
  }

  const player = new Player(bot);
  players.set(voiceChannelId, player);
  return player;
}

export function deletePlayer(voiceChannelId: string): void {
  players.delete(voiceChannelId);
}
