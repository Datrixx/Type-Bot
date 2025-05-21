import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Solución compatible con ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, "../../db");
const CONFIG_PATH = path.join(DB_DIR, "guildConfig.json");

type GuildConfig = Record<string, { logChannelId: string }>;

export async function getGuildConfig(): Promise<GuildConfig> {
    try {
        const data = await fs.readFile(CONFIG_PATH, "utf-8");
        return JSON.parse(data);
    } catch {
        return {};
    }
}

export async function setLogChannel(guildId: string, channelId: string) {
    await fs.mkdir(DB_DIR, { recursive: true });
    const config = await getGuildConfig();
    config[guildId] = { logChannelId: channelId };
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export async function getLogChannel(guildId: string): Promise<string | undefined> {
    const config = await getGuildConfig();
    return config[guildId]?.logChannelId;
}