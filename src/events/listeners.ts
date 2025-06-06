import { On, Client, Discord } from "discordx";
import {
    Interaction,
    Message,
    GuildMember,
    PartialGuildMember,
    Role,
    Channel,
    MessageReaction,
    PartialMessage,
    PartialUser,
    User,
    GuildBan,
    Invite,
    VoiceState
} from "discord.js";
import { logAction } from "../utils/logActions.js";
import { createBotLogEmbed } from "../utils/botLogEmbeds.js";
import { createEmbed, EmbedColor } from "../utils/createEmbed.js";
import "./buttonClickEvents.js";


@Discord()
export class LogAllEvents {
    @On({ event: "interactionCreate" })
    async onCommand([interaction]: [Interaction], client: Client) {
        if (!interaction.isCommand()) return;
        const logEmbed = createBotLogEmbed(
            interaction.user.id,
            interaction.commandName,
            "Comando ejecutado"
        );
        await logAction(client, interaction.guildId!, logEmbed, "bot");
    }

    @On({ event: "messageDelete" })
    async onMessageDelete([message]: [Message | PartialMessage], client: Client) {
        if (!message.guild) return;
        const author = message.author ? `<@${message.author.id}>` : "*Desconocido*";
        const embed = createEmbed({
            title: "Mensaje eliminado",
            description: `🗑️ Mensaje de ${author} eliminado en <#${message.channelId}>`,
            color: EmbedColor.WRONG,
            fields: [
                { name: "Contenido", value: message.content || "*Sin contenido*", inline: false }
            ],
            timestamp: true
        });
        await logAction(client, message.guild.id, embed, "server");
    }

    @On({ event: "messageUpdate" })
    async onMessageUpdate([oldMsg, newMsg]: [Message | PartialMessage, Message | PartialMessage], client: Client) {
        if (!newMsg.guild || !newMsg.author) return;
        if (oldMsg.content === newMsg.content) return;
        const embed = createEmbed({
            title: "Mensaje editado",
            description: `✏️ Mensaje de <@${newMsg.author.id}> editado en <#${newMsg.channelId}>`,
            color: EmbedColor.INFO,
            fields: [
                { name: "Antes", value: oldMsg.content || "*Sin contenido*", inline: false },
                { name: "Después", value: newMsg.content || "*Sin contenido*", inline: false }
            ],
            timestamp: true
        });
        await logAction(client, newMsg.guild.id, embed, "server");
    }

    @On({ event: "messageReactionAdd" })
    async onReactionAdd([reaction, user]: [MessageReaction, User | PartialUser], client: Client) {
        if (!reaction.message.guild) return;
        const embed = createEmbed({
            title: "Reacción añadida",
            description: `➕ <@${user.id}> reaccionó con ${reaction.emoji} en <#${reaction.message.channelId}>`,
            color: EmbedColor.INFO,
            timestamp: true
        });
        await logAction(client, reaction.message.guild.id, embed, "server");
    }

    @On({ event: "messageReactionRemove" })
    async onReactionRemove([reaction, user]: [MessageReaction, User | PartialUser], client: Client) {
        if (!reaction.message.guild) return;
        const embed = createEmbed({
            title: "Reacción eliminada",
            description: `➖ <@${user.id}> quitó su reacción ${reaction.emoji} en <#${reaction.message.channelId}>`,
            color: EmbedColor.INFO,
            timestamp: true
        });
        await logAction(client, reaction.message.guild.id, embed, "server");
    }

    @On({ event: "guildMemberAdd" })
    async onMemberAdd([member]: [GuildMember], client: Client) {
        const embed = createEmbed({
            title: "Nuevo miembro",
            description: `✅ <@${member.id}> se ha unido al servidor.`,
            color: EmbedColor.SUCCESS,
            timestamp: true
        });
        await logAction(client, member.guild.id, embed, "server");
    }

    @On({ event: "guildMemberRemove" })
    async onMemberRemove([member]: [GuildMember | PartialGuildMember], client: Client) {
        const embed = createEmbed({
            title: "Miembro salió",
            description: `❌ <@${member.id}> ha salido del servidor.`,
            color: EmbedColor.WRONG,
            timestamp: true
        });
        await logAction(client, member.guild.id, embed, "server");
    }

    @On({ event: "roleCreate" })
    async onRoleCreate([role]: [Role], client: Client) {
        const embed = createEmbed({
            title: "Rol creado",
            description: `🆕 Rol \`${role.name}\` creado.`,
            color: EmbedColor.INFO,
            timestamp: true
        });
        await logAction(client, role.guild.id, embed, "server");
    }

    @On({ event: "roleDelete" })
    async onRoleDelete([role]: [Role], client: Client) {
        const embed = createEmbed({
            title: "Rol eliminado",
            description: `🗑️ Rol \`${role.name}\` eliminado.`,
            color: EmbedColor.WRONG,
            timestamp: true
        });
        await logAction(client, role.guild.id, embed, "server");
    }

    @On({ event: "channelCreate" })
    async onChannelCreate([channel]: [Channel], client: Client) {
        if (!("guild" in channel) || !channel.guild) return;
        const embed = createEmbed({
            title: "Canal creado",
            description: `🆕 Canal <#${channel.id}> creado.`,
            color: EmbedColor.INFO,
            timestamp: true
        });
        await logAction(client, channel.guild.id, embed, "server");
    }

    @On({ event: "channelDelete" })
    async onChannelDelete([channel]: [Channel], client: Client) {
        if (!("guild" in channel) || !channel.guild) return;
        const embed = createEmbed({
            title: "Canal eliminado",
            description: `🗑️ Canal \`${channel.name}\` eliminado.`,
            color: EmbedColor.WRONG,
            timestamp: true
        });
        await logAction(client, channel.guild.id, embed, "server");
    }

    @On({ event: "guildBanAdd" })
    async onBanAdd([ban]: [GuildBan], client: Client) {
        const embed = createEmbed({
            title: "Usuario baneado",
            description: `🚫 <@${ban.user.id}> fue baneado del servidor.`,
            color: EmbedColor.WRONG,
            timestamp: true
        });
        await logAction(client, ban.guild.id, embed, "server");
    }

    @On({ event: "guildBanRemove" })
    async onBanRemove([ban]: [GuildBan], client: Client) {
        const embed = createEmbed({
            title: "Usuario desbaneado",
            description: `✅ <@${ban.user.id}> fue desbaneado del servidor.`,
            color: EmbedColor.SUCCESS,
            timestamp: true
        });
        await logAction(client, ban.guild.id, embed, "server");
    }

    @On({ event: "inviteCreate" })
    async onInviteCreate([invite]: [Invite], client: Client) {
        if (!invite.guild) return;
        const embed = createEmbed({
            title: "Invitación creada",
            description: `🔗 Se creó una invitación para <#${invite.channel?.id}>.\nCódigo: \`${invite.code}\`${invite.inviter ? `\nCreador: <@${invite.inviter.id}>` : ""}`,
            color: EmbedColor.INFO,
            timestamp: true
        });
        await logAction(client, invite.guild.id, embed, "server");
    }

    @On({ event: "inviteDelete" })
    async onInviteDelete([invite]: [Invite], client: Client) {
        if (!invite.guild) return;
        const embed = createEmbed({
            title: "Invitación eliminada",
            description: `❌ Se eliminó una invitación para <#${invite.channel?.id}>.\nCódigo: \`${invite.code}\``,
            color: EmbedColor.WRONG,
            timestamp: true
        });
        await logAction(client, invite.guild.id, embed, "server");
    }

    @On({ event: "voiceStateUpdate" })
    async onVoiceStateUpdate([oldState, newState]: [VoiceState, VoiceState], client: Client) {
        // Usuario se conecta a canal de voz
        if (!oldState.channel && newState.channel) {
            const member = newState.member;
            if (!member || !newState.guild) return;

            const embed = createEmbed({
                title: "Usuario conectado a canal de voz",
                description: `🎧 <@${member.id}> se conectó a <#${newState.channel.id}>.`,
                color: EmbedColor.SUCCESS,
                timestamp: true,
            });
            await logAction(client, newState.guild.id, embed, "server");
        }
        else if (oldState.channel && !newState.channel) {
            const member = oldState.member;
            if (!member || !oldState.guild) return;

            const embed = createEmbed({
                title: "Usuario desconectado de canal de voz",
                description: `📴 <@${member.id}> se desconectó de <#${oldState.channel.id}>.`,
                color: EmbedColor.WRONG,
                timestamp: true,
            });
            await logAction(client, oldState.guild.id, embed, "server");
        }
    }
}
