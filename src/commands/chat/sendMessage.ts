import { Discord, Slash, SlashOption } from "discordx";
import { ApplicationCommandOptionType, TextChannel } from "discord.js";
import { createEmbed, EmbedColor } from "../../utils/createEmbed.js";

@Discord()
export class SendMessage {
    @Slash({ name: "sendtextmessage", description: "Enviar texto simple" })
    async sendtext(
        @SlashOption({ name: "channel", description: "Canal", type: ApplicationCommandOptionType.Channel, required: true })
        channel: TextChannel,
        @SlashOption({ name: "text", description: "Texto", type: ApplicationCommandOptionType.String, required: true })
        text: string,
    ) {
        await channel.send(text);
    }

    @Slash({ name: "sendembedmessage", description: "Enviar embed" })
    async sendEmbed(
        @SlashOption({ name: "channel", description: "Canal", type: ApplicationCommandOptionType.Channel, required: true })
        channel: TextChannel,
        @SlashOption({ name: "title", description: "Titulo", type: ApplicationCommandOptionType.String, required: true })
        title: string,
        @SlashOption({ name: "description", description: "Descripcion", type: ApplicationCommandOptionType.String, required: true })
        description: string,
        @SlashOption({ name: "color", description: "Color (hex o tipo)", type: ApplicationCommandOptionType.String, required: false })
        color?: string,
        @SlashOption({ name: "timestamp", description: "¿Agregar timestamp?", type: ApplicationCommandOptionType.Boolean, required: false })
        timestamp?: boolean,
        @SlashOption({ name: "url", description: "URL del título", type: ApplicationCommandOptionType.String, required: false })
        url?: string,
        @SlashOption({ name: "author", description: "Nombre del autor", type: ApplicationCommandOptionType.String, required: false })
        author?: string,
        @SlashOption({ name: "authoricon", description: "Icono del autor (URL)", type: ApplicationCommandOptionType.String, required: false })
        authorIcon?: string,
        @SlashOption({ name: "authorurl", description: "URL del autor", type: ApplicationCommandOptionType.String, required: false })
        authorUrl?: string,
        @SlashOption({ name: "thumbnail", description: "URL del thumbnail", type: ApplicationCommandOptionType.String, required: false })
        thumbnail?: string,
        @SlashOption({ name: "image", description: "URL de la imagen", type: ApplicationCommandOptionType.String, required: false })
        image?: string,
        @SlashOption({ name: "footer", description: "Texto del footer", type: ApplicationCommandOptionType.String, required: false })
        footer?: string,
        @SlashOption({ name: "footericon", description: "Icono del footer (URL)", type: ApplicationCommandOptionType.String, required: false })
        footerIcon?: string,
    ) {
        let embedColor = EmbedColor.INFO;
        if (color) {
            embedColor = EmbedColor[color.toUpperCase() as keyof typeof EmbedColor] ?? parseInt(color.replace("#", ""), 16);
        }

        const embed = createEmbed({
            title,
            description,
            color: embedColor,
            timestamp: Boolean(timestamp),
            url,
            author: author ? { name: author, iconURL: authorIcon, url: authorUrl } : undefined,
            thumbnail,
            image,
            footer: footer ? { text: footer, iconURL: footerIcon } : undefined,
        });

        await channel.send({ embeds: [embed] });
    }
}