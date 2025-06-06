import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, "../../db");
const CONFIG_PATH = path.join(DB_DIR, "guildConfig.json");

export type LogType = "bot" | "sanction" | "server";

type GuildLogsConfig = Record<LogType, { enabled: boolean; channelId: string | null }>;

type MusicConfig = {
  musicChannelId: string | null;
  messageId?: string | null;
};

type TicketConfig = {
  ticketChannelId: string | null;
  count: number | null;
  messageId?: string | null;
};

type GuildConfig = Record<string, {
  logs: GuildLogsConfig;
  music?: MusicConfig;
  ticket?: TicketConfig;
}>;

// Función para valores por defecto
function getDefaultGuildConfig(): Omit<GuildConfig[string], "music" | "ticket"> {
  return {
    logs: {
      bot: { enabled: false, channelId: null },
      sanction: { enabled: false, channelId: null },
      server: { enabled: false, channelId: null }
    }
  };
}

// Leer configuración desde archivo
export async function getGuildConfig(): Promise<GuildConfig> {
  try {
    const data = await fs.readFile(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

// Guardar configuración en archivo
async function saveGuildConfig(config: GuildConfig) {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

// Asegurar configuración mínima para un guild
async function ensureGuildConfig(guildId: string): Promise<GuildConfig> {
  await fs.mkdir(DB_DIR, { recursive: true });
  const config = await getGuildConfig();
  if (!config[guildId]) {
    config[guildId] = getDefaultGuildConfig();
    await saveGuildConfig(config); // Importante: guardar si se creó una nueva entrada
  }
  return config;
}

// Logs
export async function getLogConfig(guildId: string): Promise<GuildLogsConfig | undefined> {
  const config = await getGuildConfig();
  return config[guildId]?.logs;
}

export async function setLogChannel(guildId: string, type: LogType, channelId: string) {
  const config = await ensureGuildConfig(guildId);
  config[guildId].logs[type].channelId = channelId;
  await saveGuildConfig(config);
}

export async function setLogEnabled(guildId: string, type: LogType, enabled: boolean) {
  const config = await ensureGuildConfig(guildId);
  config[guildId].logs[type].enabled = enabled;
  await saveGuildConfig(config);
}

// Música
export async function getMusicChannel(guildId: string): Promise<string | null> {
  const config = await getGuildConfig();
  return config[guildId]?.music?.musicChannelId || null;
}

export async function setMusicChannel(guildId: string, channelId: string) {
  const config = await ensureGuildConfig(guildId);
  const guild = config[guildId];

  if (!guild.music) guild.music = { musicChannelId: channelId };
  else guild.music.musicChannelId = channelId;

  await saveGuildConfig(config);
}

export async function getMusicPanelMessageId(guildId: string): Promise<string | null> {
  const config = await getGuildConfig();
  return config[guildId]?.music?.messageId ?? null;
}

export async function setMusicPanelMessageId(guildId: string, messageId: string) {
  const config = await ensureGuildConfig(guildId);
  const guild = config[guildId];

  if (!guild.music) guild.music = { musicChannelId: null, messageId };
  else guild.music.messageId = messageId;

  await saveGuildConfig(config);
}

// Tickets
export async function setTicketChannel(guildId: string, channelId: string) {
  const config = await ensureGuildConfig(guildId);
  const guild = config[guildId];

  if (!guild.ticket) {
    guild.ticket = { ticketChannelId: channelId, count: 0 };
  } else {
    guild.ticket.ticketChannelId = channelId;

    if (typeof guild.ticket.count !== "number") {
      guild.ticket.count = 0;
    }
  }

  await saveGuildConfig(config);
}

export async function getTicketCount(guildId: string) {
  const config = await ensureGuildConfig(guildId);
  return config[guildId]?.ticket?.count ?? 0;
}

export async function incrementTicketCount(guildId: string) {
  const config = await ensureGuildConfig(guildId);

  if (!config[guildId]) {
    config[guildId] = getDefaultGuildConfig();
  }

  if (!config[guildId].ticket) {
    config[guildId].ticket = { ticketChannelId: null, count: 1 };
  } else {
    if (typeof config[guildId].ticket.count !== "number") {
      config[guildId].ticket.count = 0;
    }
    config[guildId].ticket.count += 1;
  }

  await saveGuildConfig(config);
}
