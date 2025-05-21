import { Discord, Slash, SlashOption } from "discordx";
import { ApplicationCommandOptionType, CommandInteraction, TextChannel, Client } from "discord.js";
import { setLogChannel } from "../../utils/guildConfig.js";

@Discord()
export class SanctionLogSetup {
    @Slash({ name: "sanctionlogsetup", description: "Configura el canal de logs de sanciones" })
    async setup(
        @SlashOption({ name: "channel", description: "Canal de logs", type: ApplicationCommandOptionType.Channel, required: true })
        channel: TextChannel,
        interaction: CommandInteraction,
        client: Client
    ) {
        await setLogChannel(interaction.guildId!, channel.id);
        await interaction.reply({ content: `✅ Canal de logs de sanciones configurado: <#${channel.id}>`, flags: 64 });
    }
}