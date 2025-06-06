import { Discord, Slash, SlashOption } from "discordx";
import { CommandInteraction, ApplicationCommandOptionType, TextChannel } from "discord.js";
import { setLogChannel, setLogEnabled, LogType } from "../../utils/guildConfig.js";

@Discord()
export class LogsConfig {
    @Slash({ name: "setlogchannel", description: "Configura el canal de logs para un tipo" })
    async setLogChannelCmd(
        @SlashOption({ name: "type", description: "Tipo de log [bot, server, sanction]", type: ApplicationCommandOptionType.String, required: true })
        type: LogType,
        @SlashOption({ name: "channel", description: "Canal de logs", type: ApplicationCommandOptionType.Channel, required: true })
        channel: TextChannel,
        interaction: CommandInteraction
    ) {
        await setLogChannel(interaction.guildId!, type, channel.id);
        await interaction.reply({ content: `✅ Canal de logs para **${type}** configurado: <#${channel.id}>`, ephemeral: true });
        
    }

    @Slash({ name: "enablelog", description: "Activa los logs para un tipo" })
    async enableLog(
        @SlashOption({ name: "type", description: "Tipo de log [bot, server, sanction]", type: ApplicationCommandOptionType.String, required: true })
        type: LogType,
        interaction: CommandInteraction
    ) {
        await setLogEnabled(interaction.guildId!, type, true);
        await interaction.reply({ content: `✅ Logs de **${type}** activados.`, ephemeral: true });
    }

    @Slash({ name: "disablelog", description: "Desactiva los logs para un tipo" })
    async disableLog(
        @SlashOption({ name: "type", description: "Tipo de log [bot, server, sanction]", type: ApplicationCommandOptionType.String, required: true })
        type: LogType,
        interaction: CommandInteraction
    ) {
        await setLogEnabled(interaction.guildId!, type, false);
        await interaction.reply({ content: `❌ Logs de **${type}** desactivados.`, ephemeral: true });
    }
}