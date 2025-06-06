import { TextChannel } from "discord.js";

/**
 * Devuelve un buffer con el log del ticket como archivo de texto virtual.
 */
export async function generateTicketLog(channel: TextChannel): Promise<Buffer> {
  const messages = await channel.messages.fetch({ limit: 100 });
  const sorted = Array.from(messages.values()).sort(
    (a, b) => a.createdTimestamp - b.createdTimestamp
  );

  const lines = sorted.map((msg) => {
    const time = new Date(msg.createdTimestamp).toISOString();
    const author = `${msg.author.tag}`;
    const content = msg.content.replace(/\n/g, " ");
    return `[${time}] ${author}: ${content}`;
  });

  return Buffer.from(lines.join("\n"), "utf-8");
}
