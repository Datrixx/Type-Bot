import { dirname, importx } from "@discordx/importer";
import type { Interaction, Message } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import "dotenv/config.js";
import { loadCommands } from "./utils/loadCommands.js";
import "./commands/server/help.js";
import { setBotStatus } from "./bot/status.js";
import "../src/events/listeners.js";
import "./commands/music/play.js";
import "./commands/music/stop.js";
import { getMusicPlayer, initializeMusicPlayer } from "./commands/music/player.js";
import { setupMusicEventHandlers } from "./utils/musicEvents.js";
import { restorePanelMessage } from "./utils/musicPanelManager.js";


import { YoutubeiExtractor } from "discord-player-youtubei";
import {
  SpotifyExtractor,
  VimeoExtractor,
  AttachmentExtractor,
  AppleMusicExtractor
} from "@discord-player/extractor";

export const PREFIX = "!";

export const bot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent
  ],
  silent: false,
  simpleCommand: {
    prefix: PREFIX,
  },
});

bot.once("ready", async () => {
  void bot.initApplicationCommands();
  console.log("✅ Bot iniciado");
  await restorePanelMessage(bot);
});

bot.on("interactionCreate", async (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});
bot.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;

  if (
    message.mentions.has(bot.user!) &&
    message.content.trim() === `<@${bot.user!.id}>`
  ) {
    const interaction = {
      commandName: "help",
      user: message.author,
      channel: message.channel,
      guild: message.guild,
      reply: (options: any) => {
        if ("send" in message.channel && typeof message.channel.send === "function") {
          return (message.channel as any).send(options);
        }
        return Promise.resolve();
      },
    } as any;

    const { Help } = await import("./commands/server/help.js");
    const helpInstance = new Help();
    await helpInstance.help(interaction, bot);
    return;
  }
  void bot.executeCommand(message);
});

async function run() {
  await loadCommands();
  setBotStatus(bot);

  

  initializeMusicPlayer(bot);
  const musicPlayer = getMusicPlayer();

  await musicPlayer.extractors.register(YoutubeiExtractor, {});
  await musicPlayer.extractors.register(AppleMusicExtractor, {});
  await musicPlayer.extractors.register(SpotifyExtractor, {});
  await musicPlayer.extractors.register(VimeoExtractor, {});
  await musicPlayer.extractors.register(AttachmentExtractor, {});

  musicPlayer.events.on("error", (queue, error) => {
    console.error("[Player Error]:", error);
  });

  console.log("🎧 Extractores registrados:", musicPlayer.extractors.store.map(e => e.constructor.name));


  setupMusicEventHandlers();

  if (!process.env.BOT_TOKEN) {
    throw new Error("❌ BOT_TOKEN no definido en el archivo .env");
  }

  await bot.login(process.env.BOT_TOKEN);
}

void run();
