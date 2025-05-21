import { Discord, Slash, SlashOption } from "discordx";
import { ApplicationCommandOptionType, CommandInteraction, GuildMember, Client } from "discord.js";
import { applySanction } from "../../utils/sanctionActions.js";
import { fileURLToPath } from "url";

@Discord()
export class Sanction {
    @Slash({ name: "kick", description: "Expulsar a un usuario" })
    async kick(
        @SlashOption({ name: "user", description: "Usuario", type: ApplicationCommandOptionType.User, required: true })
        user: GuildMember,
        @SlashOption({ name: "reason", description: "Razón", type: ApplicationCommandOptionType.String, required: false })
        reason: string | undefined,
        interaction: CommandInteraction,
        client: Client
    ) {
        await applySanction("kick", user, reason, interaction, client);
    }

    @Slash({ name: "ban", description: "Banear a un usuario" })
    async ban(
        @SlashOption({ name: "user", description: "Usuario", type: ApplicationCommandOptionType.User, required: true })
        user: GuildMember,
        @SlashOption({ name: "reason", description: "Razón", type: ApplicationCommandOptionType.String, required: false })
        reason: string | undefined,
        interaction: CommandInteraction,
        client: Client
    ) {
        await applySanction("ban", user, reason, interaction, client);
    }

    @Slash({ name: "mute", description: "Mutear temporalmente a un usuario" })
    async mute(
        @SlashOption({ name: "user", description: "Usuario", type: ApplicationCommandOptionType.User, required: true })
        user: GuildMember,
        @SlashOption({ name: "time", description: "Duración del mute (1h, 30s, 30m, etc)", type: ApplicationCommandOptionType.String, required: true })
        time: string,
        @SlashOption({ name: "reason", description: "Razón", type: ApplicationCommandOptionType.String, required: false })
        reason: string | undefined,
        interaction: CommandInteraction,
        client: Client
    ) {
        await applySanction("mute", user, reason, interaction, client, time);
    }
}
