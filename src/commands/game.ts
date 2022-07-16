import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../interfaces/Command";
import { bggSearchNoExpansion, getThingIdFromBGGSearch, lookingForPlayerEmbed } from "../service/bgg-service";

export const game: Command = {
    data: new SlashCommandBuilder()
    .setName("lfp")
    .setDescription("Looking for Players: list the game, time and player count that you want to play.")
    .addStringOption(option =>
        option.setName('game')
            .setDescription('The name of the game you want to play.')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('time')
        .setDescription('Time the game will start')
        .setRequired(true))
    .addStringOption(option => 
            option.setName('players')
            .setDescription('Number of players')
            .setRequired(true)),  
            
            
    run: async (interaction) => {
        const game = interaction.options.getString('game', true);
        const time = interaction.options.getString('time', true);
        const players = interaction.options.getString('players', true);

        bggSearchNoExpansion(game)
        .then(result => getThingIdFromBGGSearch(result))
        .then(bggResults => lookingForPlayerEmbed(bggResults, interaction, game, time, players))

    } 
};
