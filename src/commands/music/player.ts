import { Player } from "discord-player";
import type { Client } from "discordx";

let musicPlayer: Player | null = null;

export const getMusicPlayer = (): Player => {
    if (!musicPlayer) {
        throw new Error("El reproductor de música no está inicializado.");
    }
    return musicPlayer;
};

export const initializeMusicPlayer = (bot: any): void => {
    musicPlayer = new Player(bot);
};
