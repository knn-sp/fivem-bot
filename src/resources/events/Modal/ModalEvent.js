import Event from "../../../base/Event.js"
import { createEmbed } from "../../../functions/Embeds/CreateEmbed.js";
import { createMenu, createRow } from "../../../functions/Interactions/CreateSelectMenu.js";
import { createButton } from "../../../functions/Interactions/CreateButton.js";
import config from "../../config.json" assert {type: 'json'};
import moment from "moment";
import { ActionRowBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, PermissionsBitField, TextInputBuilder, TextInputStyle } from "discord.js";
moment.locale('pt-br');
import mysql2 from 'mysql2/promise';

export default class InteractionCreateEvent extends Event {
    constructor() {
        super({ name: 'interactionCreate' });
    }

    async run(client, interaction) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === "modal_wl") {

            const idJogo = interaction.fields.getTextInputValue("id_jogo")
            const namePersonagem = interaction.fields.getTextInputValue("name_pers")

            const member = interaction.member;

            try {
                const connection = await mysql2.createPool({
                    host: config.mysql.host,
                    user: config.mysql.user,
                    password: config.mysql.password,
                    database: config.mysql.database
                });

                const [whitelistRows] = await connection.execute(
                    `SELECT whitelisted FROM vrp_users WHERE id = ?`, [idJogo],
                );

                const hasWhitelist = whitelistRows.lenght > 0 && whitelistRows[0].whitelist === 1;

                if (hasWhitelist) {
                    return interaction.reply({ content: "O ID inserido já possui whitelist.", ephemeral: true });
                }

                const [idExistsRows] = await connection.execute(
                    `SELECT COUNT(*) AS count, discord FROM vrp_users WHERE id = ?`, [idJogo],
                )

                const idExists = idExistsRows[0].count > 0;
                const discordInDatabase = idExistsRows[0].discord;

                if (discordInDatabase && discordInDatabase !== interaction.user.id) {
                    return interaction.reply({ content: "O ID inserido está em uso por outro membro do discord.", ephemeral: true });
                }

                if (!idExists) {
                    return interaction.reply({ content: "O ID inserido não existe.", ephemeral: true });
                }

                const sql = `UPDATE vrp_users SET whitelisted = 1, discord = ? WHERE id = ?`;
                await connection.execute(sql, [interaction.user.id, idJogo]);
                const roleApprovedId = config.roles.approved;
                const roleRemovedId = config.roles.remove;

                if (roleApprovedId) {
                    if (member.roles.cache.has(roleApprovedId)) {
                        member.roles.remove(roleApprovedId);
                    }

                    const verifyRoleApproved = interaction.guild.roles.cache.get(roleApprovedId);

                    if (verifyRoleApproved) {
                        if (member.roles.cache.has(roleRemovedId)) {
                            await member.roles.remove(roleRemovedId);
                            await interaction.reply({ content: `Você foi liberado para jogar no servidor!`, ephemeral: true });

                            // LOGS

                            const EmbedLogs = new EmbedBuilder()
                            .setAuthor({ name: "Um novo jogador foi liberado!", iconURL: client.user.displayAvatarURL() })
                            .setDescription(`O usuário **${member.user.tag}** foi liberado para jogar no servidor!
                            
                            > **ID:** ${idJogo}
                            > **Nome do personagem:** ${namePersonagem}
                            > **Horário:** ${moment().format('LLLL')}`)
                            .setColor("DarkGreen")

                            const channelsLogs = interaction.guild.channels.cache.get(config.channels["whitelist.logs"]);

                            if (channelsLogs) {
                                await channelsLogs.send({ embeds: [EmbedLogs] });
                            }

                            // LOGS
                        }

                        await member.roles.add(verifyRoleApproved);

                        const newName = `${namePersonagem} - ${idJogo}`;
                        await member.setNickname(newName);
                    } else {
                        console.error(`O cargo de aprovado ID: ${roleApprovedId} não existe.`);
                    }
                } else {
                    console.error(`O cargo de aprovado ID: ${roleApprovedId} não existe.`);
                }
            } catch (error) {
                console.log(error);
            }
		}	
    }
}