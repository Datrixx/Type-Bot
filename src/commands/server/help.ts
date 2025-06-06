import { Discord, Slash, Client, On, MetadataStorage } from "discordx";
import { CommandInteraction, ActionRowBuilder, StringSelectMenuBuilder, Interaction, ButtonBuilder, ButtonStyle, TextChannel } from "discord.js";
import { createEmbed, EmbedColor } from "../../utils/createEmbed.js";

// Enum for command categories
enum CommandCategory {
    ADMIN = "admin",
    MOD = "mod",
    UTILITY = "utility",
    MUSIC = "music",
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
    play: CommandCategory.MUSIC,
    stop: CommandCategory.MUSIC,
    queue: CommandCategory.MUSIC,
    skip: CommandCategory.MUSIC,
    now: CommandCategory.MUSIC,
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

function getMainMenuEmbed(botAvatar: string, username: string) {
    return createEmbed({
        title: "TypeBot Help Menu",
        description: "TypeBot is a simple TS bot. Explore its features and see the list of available commands.",
        color: EmbedColor.INFO,
        fields: [
            {
                name: "📝 Commands",
                value: "Browse through TypeBot's commands list and find new utilities!",
                inline: false
            },
            {
                name: "Useful Links",
                value: "[Website](https://tusitio.com) | [Support](https://tusitio.com/soporte)",
                inline: false
            }
        ],
        thumbnail: botAvatar,
        footer: { text: `Call by ${username}` },
        timestamp: true
    });
}

function getMainMenuRow() {
    const select = new StringSelectMenuBuilder()
        .setCustomId("help-category")
        .setPlaceholder("Select what you need help with")
        .addOptions([
            {
                label: "Commands",
                value: "commands",
                description: "See all available commands",
                emoji: "📝"
            }
        ]);
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

function getCategorySelectRow() {
    const categoryOrder = [
        CommandCategory.ADMIN,
        CommandCategory.UTILITY,
        CommandCategory.MOD,
        CommandCategory.MUSIC,
        CommandCategory.OTHER
    ];
    const select = new StringSelectMenuBuilder()
        .setCustomId("help-category-detail")
        .setPlaceholder("Select a command category")
        .addOptions(
            categoryOrder.map(cat => ({
                label: cat.charAt(0).toUpperCase() + cat.slice(1),
                value: cat,
                description: `Show commands for ${cat}`
            }))
        );
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

function getBackButtonRow(customId = "help-back-main") {
    const backButton = new ButtonBuilder()
        .setCustomId(customId)
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary);
    return new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);
}

function getCommandsByCategoryEmbed() {
    const categories = getCategoriesAndCommands();
    const categoryOrder = [
        CommandCategory.ADMIN,
        CommandCategory.UTILITY,
        CommandCategory.MOD,
        CommandCategory.MUSIC,
        CommandCategory.OTHER
    ];

    const fields = categoryOrder.flatMap(cat => {
        const cmds = categories[cat];
        if (cmds && cmds.length) {
            return [{
                name: `• ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
                value: '',
                inline: true
            }];
        }
        return [];
    });

    return createEmbed({
        title: "Bot Commands",
        description: "Select a category to see its commands.",
        color: EmbedColor.INFO,
        fields
    });
}

@Discord()
export class Help {
    @Slash({ name: "help", description: "Show the help menu" })
    async help(interaction: CommandInteraction, client: Client) {
        const botAvatar = client.user?.displayAvatarURL() ?? "";
        const embed = getMainMenuEmbed(botAvatar, interaction.user.username);
        const row = getMainMenuRow();

        await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
    }

    @On({ event: "interactionCreate" })
    async onCategorySelect([interaction]: [Interaction]) {
        try {
            if (
                interaction.isStringSelectMenu?.() &&
                interaction.customId === "help-category"
            ) {
                if (interaction.values[0] === "commands") {
                    const embed = getCommandsByCategoryEmbed();
                    await interaction.update({
                        embeds: [embed],
                        components: [getCategorySelectRow(), getBackButtonRow("help-back-main")]
                    });
                }
            }
            else if (
                interaction.isStringSelectMenu?.() &&
                interaction.customId === "help-category-detail"
            ) {
                const categories = getCategoriesAndCommands();
                const cat = interaction.values[0];
                const cmds = categories[cat] || [];
                const embed = createEmbed({
                    title: `Commands in ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
                    color: EmbedColor.INFO,
                    description: cmds.length
                        ? "Here command from category:\n\n" +
                          cmds.map(cmd => `\`/${cmd.name}\`: ${cmd.description}`).join("\n")
                        : "No commands in this category."
                });
                await interaction.update({
                    embeds: [embed],
                    components: [getCategorySelectRow(), getBackButtonRow("help-back-categories")]
                });
            }
            else if (
                interaction.isButton?.() &&
                (interaction.customId === "help-back-main" || interaction.customId === "help-back-categories")
            ) {
                if (interaction.customId === "help-back-main") {
                    const botAvatar = interaction.client.user?.displayAvatarURL() ?? "";
                    const embed = getMainMenuEmbed(botAvatar, interaction.user.username);
                    const row = getMainMenuRow();
                    await interaction.update({
                        embeds: [embed],
                        components: [row]
                    });
                } else if (interaction.customId === "help-back-categories") {
                    const embed = getCommandsByCategoryEmbed();
                    await interaction.update({
                        embeds: [embed],
                        components: [getCategorySelectRow(), getBackButtonRow("help-back-main")]
                    });
                }
            }
        } catch (error) {
            console.error("[HELP] Error in interactionCreate:", error);
            if ("isRepliable" in interaction && interaction.isRepliable()) {
                await interaction.reply({
                    content: "❌ An error occurred while displaying the help menu.",
                    ephemeral: true
                }).catch(() => {});
            }
        }
    }
}