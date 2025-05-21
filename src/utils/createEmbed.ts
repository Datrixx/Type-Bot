import { EmbedBuilder, ColorResolvable, APIEmbedField } from "discord.js";

export enum EmbedColor {
    SUCCESS = 0x57F287,
    WRONG = 0xED4245,  
    WARNING = 0xFEE75C,
    INFO = 0x5865F2,   
    PERSONALIZE = 0    
}

interface CreateEmbedOptions {
    title?: string;
    description?: string;
    color?: EmbedColor | ColorResolvable;
    url?: string;
    author?: { name: string; iconURL?: string; url?: string };
    thumbnail?: string;
    image?: string;
    fields?: APIEmbedField[];
    footer?: { text: string; iconURL?: string };
    timestamp?: boolean;
}

export function createEmbed(options: CreateEmbedOptions) {
    const embed = new EmbedBuilder();

    if (options.color) embed.setColor(options.color);
    if (options.title) embed.setTitle(options.title);
    if (options.url) embed.setURL(options.url);
    if (options.author) embed.setAuthor(options.author);
    if (options.description) embed.setDescription(options.description);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.fields && options.fields.length > 0) embed.addFields(options.fields);
    if (options.image) embed.setImage(options.image);
    if (options.footer) embed.setFooter(options.footer);
    if (options.timestamp) embed.setTimestamp();

    return embed;
}