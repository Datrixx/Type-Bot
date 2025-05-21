import { Discord, Slash, Client, On, MetadataStorage } from "discordx";
import { CommandInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, Interaction, ButtonBuilder, ButtonStyle } from "discord.js";

// Enum for command categories
enum CommandCategory {
    ADMIN = "admin",
    MOD = "mod",
    UTILITY = "utility",
    OTHER = "other"
}


const commandCategories: Record<string, CommandCategory> = {
    kick: CommandCategory.ADMIN,
    ban: CommandCategory.ADMIN,
    mute: CommandCategory.ADMIN,
    nukechannel: CommandCategory.MOD,
    nuketext: CommandCategory.MOD,
    sanctionlogsetup: CommandCategory.ADMIN,
    sendtextmessage: CommandCategory.UTILITY,
    sendembedmessage: CommandCategory.UTILITY,
    ping: CommandCategory.OTHER,
    help: CommandCategory.OTHER

};

function getCategoriesAndCommands() {
    const categories: Record<string, { name: string, description: string }[]> = {};

    for (const cmd of MetadataStorage.instance.applicationCommandSlashes) {
        const category = commandCategories[cmd.name] || CommandCategory.OTHER;
        if (!categories[category]) categories[category] = [];
        categories[category].push({
            name: cmd.name,
            description: cmd.description
        });
    }

    return categories;
}

function getMainMenuEmbed(categories: Record<string, { name: string, description: string }[]>) {
    return new EmbedBuilder()
        .setTitle("Bot Commands")
        .setDescription("Select a category to see its commands.")
        .setColor(0xED459A)
        .addFields([
            { name: "Categories", value: Object.keys(categories).map(c => `• ${c}`).join("\n"), inline: false },
            { name: "Useful Links", value: "[Website](https://tusitio.com) | [Support](https://tusitio.com/soporte)", inline: false }
        ]);
}

function getMainMenuRow(categories: Record<string, { name: string, description: string }[]>) {
    const select = new StringSelectMenuBuilder()
        .setCustomId("help-category")
        .setPlaceholder("Select a category")
        .addOptions(
            Object.keys(categories).map(cat => ({
                label: cat.charAt(0).toUpperCase() + cat.slice(1),
                value: cat
            }))
        );
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

function getBackButtonRow() {
    const backButton = new ButtonBuilder()
        .setCustomId("help-back")
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary);
    return new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);
}

@Discord()
export class Help {
    @Slash({ name: "help", description: "Show the list of commands by category" })
    async help(interaction: CommandInteraction, client: Client) {
        const categories = getCategoriesAndCommands();
        const embed = getMainMenuEmbed(categories);
        const row = getMainMenuRow(categories);

        await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
    }

    @On({ event: "interactionCreate" })
    async onCategorySelect([interaction]: [Interaction]) {
        try {
            if (
                interaction.isStringSelectMenu?.() &&
                interaction.customId === "help-category"
            ) {
                const categories = getCategoriesAndCommands();
                const category = interaction.values[0];
                const commands = categories[category] || [];
                const embed = new EmbedBuilder()
                    .setTitle(`Commands in ${category.charAt(0).toUpperCase() + category.slice(1)}`)
                    .setDescription(
                        commands.length
                            ? commands.map(cmd => `• \`/${cmd.name}\` : ${cmd.description}`).join("\n")
                            : "There are no commands in this category."
                    )
                    .setColor(0xED459A);

                await interaction.update({
                    embeds: [embed],
                    components: [getBackButtonRow()]
                });
            } else if (
                interaction.isButton?.() &&
                interaction.customId === "help-back"
            ) {
                const categories = getCategoriesAndCommands();
                const embed = getMainMenuEmbed(categories);
                const row = getMainMenuRow(categories);

                await interaction.update({
                    embeds: [embed],
                    components: [row]
                });
            }
        } catch (error) {
            console.error("[HELP] Error in interactionCreate:", error);
            if ("isRepliable" in interaction && interaction.isRepliable()) {
                await interaction.reply({
                    content: "❌ An error occurred while displaying the category commands.",
                    ephemeral: true
                }).catch(() => {});
            }
        }
    }
}