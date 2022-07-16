import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton } from "discord.js";
import { Command } from "../interfaces/Command";
import { bggSearch, getThingIdFromBGGSearch, searchEmbed } from "../service/bgg-service";

export const search: Command = {
    data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search BoardGameGeek for game info. Args: <game_name>")
    .addStringOption(option =>
        option.setName('name')
            .setDescription('The name of the game you want to search for.')
            .setRequired(true)
    ),
    run: async (interaction) => {
        const name = interaction.options.getString('name', true);

        bggSearch(name)
            .then(result => getThingIdFromBGGSearch(result))
            .then(bggSearchResult => {
                searchEmbed(bggSearchResult, interaction);
            });
      },
};