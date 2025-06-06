import { QueryType } from "discord-player";

export async function defragmentPlaylist(query: string, musicPlayer: any) {
    const isSpotify = query.includes("spotify.com");
    const isYouTubePlaylist = query.includes("list=");
    const isAppleMusic = query.includes("music.apple.com/cl/playlist/");

    let type: QueryType = QueryType.AUTO;

    if (isSpotify) {
        type = QueryType.SPOTIFY_PLAYLIST;
    } else if (isYouTubePlaylist) {
        type = QueryType.YOUTUBE_PLAYLIST;
    } else if (isAppleMusic) {
        type = QueryType.AUTO;
    }

    console.log("🧩 Detectado tipo de búsqueda:", type);

    const result = await musicPlayer.search(query, {
        requestedBy: null,
        type,
    });

    if (!result || !result.tracks.length) {
        console.log("🚫 No se encontraron pistas.");
        return null;
    }

    if (result.playlist) {
        console.log(`✅ Playlist encontrada: ${result.playlist.title}, ${result.tracks.length} pistas.`);
        return result.tracks;
    }

    console.log("🔸 No es una playlist. Ignorando como tal.");
    return null;
}
