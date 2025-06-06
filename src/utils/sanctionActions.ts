import { CommandInteraction, GuildMember, Client } from "discord.js";
import { createSanctionLogEmbed } from "./sanctionEmbeds.js";
import { logAction } from "./logActions.js";
import { createEmbed, EmbedColor } from "./createEmbed.js";
import { parseDuration } from "./parseDuration.js";

// Handlers for type sanctions
const sanctionHandlers = {
    kick: async (user: GuildMember, reason?: string) => user.kick(reason),
    ban: async (user: GuildMember, reason?: string) => user.ban({ reason }),
    mute: async (user: GuildMember, ms: number, reason?: string) => user.timeout(ms, reason),
};

type SanctionType = keyof typeof sanctionHandlers;

const sanctionVerbs: Record<SanctionType, string> = {
    kick: "expulsado",
    ban: "baneado",
    mute: "muteado",
};

const sanctionLogs: Record<SanctionType, string> = {
    kick: "Kick",
    ban: "Ban",
    mute: "Mute",
};

// @Overload
export async function applySanction(
    action: "kick" | "ban",
    user: GuildMember,
    reason: string | undefined,
    interaction: CommandInteraction,
    client: Client
): Promise<void>;
export async function applySanction(
    action: "mute",
    user: GuildMember,
    reason: string | undefined,
    interaction: CommandInteraction,
    client: Client,
    time: string
): Promise<void>;

export async function applySanction(
    action: SanctionType,
    user: GuildMember,
    reason: string | undefined,
    interaction: CommandInteraction,
    client: Client,
    time?: string
)
// Logic
{
    const verb = sanctionVerbs[action];
    const logType = sanctionLogs[action];

    const ctxEmbed = createEmbed({
        title: `Usuario ${verb} ⚒️`,
        description: `⚠️ El usuario <@${user.id}> ha sido ${verb}.${reason ? `\n**Razón:** ${reason}` : ""}`,
        color: EmbedColor.SUCCESS,
        timestamp: true,
    });

    const dmEmbed = createEmbed({
        title: `Has sido ${verb} ⚒️⚠️`,
        description: `⚡ Has sido ${verb} del servidor **${interaction.guild?.name}**.${reason ? `\n**Razón:** ${reason}` : ""}`,
        color: EmbedColor.WRONG,
        timestamp: true,
    });

    try {
        const logEmbed = createSanctionLogEmbed(interaction.user.id, user.id, logType, reason);
        await logAction(client, interaction.guildId!, logEmbed, "sanction");
    } catch (error: any) {
        console.error(`[!] Error al registrar la sanción: ${error?.message || error}`);
    }

    try {
        await user.send({ embeds: [dmEmbed] }).catch((error) => {
            console.error(`[!] Error al enviar DM al usuario: ${error?.message || error}`);
        });

        if (action === "mute") {
            if (!time) throw new Error("Debes especificar el tiempo para mute.");
            const ms = parseDuration(time);
            if (!ms) {
                await interaction.reply({
                    content: "❌ Formato de tiempo inválido. Usa ejemplos como: `30s`, `10m`, `2h`.",
                    ephemeral: true,
                });
                return;
            }
            await sanctionHandlers.mute(user, ms, reason);
        } else {
            await sanctionHandlers[action](user, reason);
        }

        await interaction.reply({ embeds: [ctxEmbed], flags: 64 });

    } catch (error: any) {
        console.error(`[!] Error al aplicar la sanción: ${error?.message || error}`);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: `❌ No tengo permisos para ${verb} a este usuario.`,
                flags: 64,
            });
        }
    }
}