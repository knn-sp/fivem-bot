import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/Command.js";
import { cooldown } from "../../../functions/Cooldown/Cooldown.js";
import { JsonDatabase } from "wio.db";

const messagesConfig = new JsonDatabase({ databasePath: "src/config/messages.json" });

export default class SetCommand extends Command {
    constructor(client) {
        super(client, {
            name: "setup",
            description: "Comando para enviar as mensagens de setup.",
            options: [
                {
                    name: "message-whitelist",
                    description: "Envie a mensagem de whitelist.",
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: "message-connect",
                    description: "Envie a mensagem de conexão.",
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ],
        });

        this.config = {
            ephemeral: false,
            autoDefer: false,
            requireDatabase: false,
        };
    }

    run(interaction) {

        if (!interaction.channel.permissionsFor(interaction.user).has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: `Você não possui permissão para isso!`,
                ephemeral: true,
            });
        }

        if (interaction.options.getSubcommand() === "message-whitelist") {

            const Embed = new EmbedBuilder()
                .setAuthor({ name: "Liberando sua whitelsit!", iconURL: this.client.user.displayAvatarURL() })
                .setDescription(`Efetue a whitelist para jogar em nossa cidade, é bem fácil basta seguir os passo a passo abaixo:
            
            > **Primeiro:** Clique no botão abaixo e preencha o formulário de cadastro.
            > **Segundo:** Aguarde o bot verificar e pronto!`)
                .setColor("DarkGreen")

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("whitelist")
                        .setLabel("Fazer minha whitelist")
                        .setStyle(ButtonStyle.Secondary)
                )

            interaction.reply({ content: `A mensagem de whitelist foi setada!`, ephemeral: true });
            interaction.channel.send({ embeds: [Embed], components: [row] });
        }

        if (interaction.options.getSubcommand() === "message-connect") {

            interaction.reply({ content: `A mensagem de conexão foi setada!`, ephemeral: true });
            interaction.channel.send({ content: "Loading..." }).then(msg => {
                messagesConfig.set("messages",
                    {
                        "messageId": msg.id,
                        "channelId": interaction.channel.id
                    }
                )
            });
        }
    }
}