import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import config from "../../resources/config.json" assert {type: 'json'};
import cfx from 'cfx-api';
import { JsonDatabase } from "wio.db";
import moment from "moment";

const messagesConfig = new JsonDatabase({ databasePath: "src/config/messages.json" });

export async function updateStatusFiveM(client) {
    try {
        const server = await cfx.fetchServer("qyv8qv")

        const lastUpdateTimestamp = moment().valueOf();

        if (server) {
            const EmbedPing = new EmbedBuilder()
                .setAuthor({ name: client.guilds.cache.get(config.guildId).name, iconURL: client.user.displayAvatarURL() })
                .setDescription(`Acompanhe o status do nosso servidor abaixo:
        
                > Status: **ONLINE**
                > Jogadores: \`${server.data.clients}\`
                > Conecte-se: [conectar](https://cfx.re/join/qyv8qv)
                > Última atualização: <t:${Math.floor(lastUpdateTimestamp / 1000)}:R>`)
                .setColor("DarkGreen")
                .setFooter({ text: "Atualiza a cada 30 segundos.", iconURL: client.user.displayAvatarURL() })

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setURL("https://pro5m-bot.com/redirect/crushpvp/fivem/")
                    .setLabel("Conectar-se ao FiveM")
                    .setStyle(ButtonStyle.Link),

                    new ButtonBuilder()
                    .setURL("https://www.tiktok.com/@crushpvpoficial")
                    .setLabel("TikTok")
                    .setStyle(ButtonStyle.Link),

                    new ButtonBuilder()
                    .setURL("https://www.instagram.com/redecrush/")
                    .setLabel("Instagram")
                    .setStyle(ButtonStyle.Link),

                    new ButtonBuilder()
                    .setURL("https://crushpvp.centralcart.com.br/")
                    .setLabel("Loja")
                    .setStyle(ButtonStyle.Link),
                )

            const messageId = messagesConfig.get("messages.messageId");
            const channelId = messagesConfig.get("messages.channelId");

            const channel = await client.channels.fetch(channelId);

            if (!channel) throw new Error(`O canal com ID ${channelId} não foi encontrado!`);

            const message = await channel.messages.fetch(messageId);
            if (message) {
                await message.edit({ content: null, embeds: [EmbedPing], components: [row] });
            }
        } else {
            const EmbedPing = new EmbedBuilder()
                .setAuthor({ name: client.guilds.cache.get(config.guildId).name, iconURL: client.user.displayAvatarURL() })
                .setDescription(`Acompanhe o status do nosso servidor abaixo:
        
                > Status: **OFFLINE**
                > Jogadores: ${server.data.clients}
                > Conecte-se: cfx.re/join/qyv8qv`)
                .setColor("Red")
                .setFooter({ text: "Atualiza a cada 30 segundos.", iconURL: client.user.displayAvatarURL() })

            const messageId = messagesConfig.get("messages.messageId");
            const channelId = messagesConfig.get("messages.channelId");

            const channel = await client.channels.fetch(channelId);

            if (!channel) throw new Error(`O canal com ID ${channelId} não foi encontrado!`);

            const message = await channel.messages.fetch(messageId);
            if (message) {
                await message.edit({ content: null, embeds: [EmbedPing] });
            }
        }
    } catch (error) {
        console.log(error);
    }
}