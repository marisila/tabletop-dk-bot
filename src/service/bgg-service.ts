import { Search } from "../interfaces/search-model";

import { request } from 'undici'
import bggXmlApiClient from "bgg-xml-api-client";
import { CommandInteraction, CacheType, MessageButton } from "discord.js";

export const bggSearch = async (boardGame: string): Promise<JSON> => {
    
    return request('https://boardgamegeek.com/search/boardgame?q='+boardGame, {
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    }).then(
        response => {
            return response.body.json().then (
                json => {
                    return json;
                }
            );
        }
    )
};

export const bggSearchNoExpansion = async (boardGame: string): Promise<JSON> => {
    
    return request('https://boardgamegeek.com/geeksearch.php?action=search&advsearch=1&objecttype=boardgame&q='+ boardGame +'&nopropertyids%5B%5D=1042', {
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    }).then(
        response => {
            return response.body.json().then (
                json => {
                    return json;
                }
            );
        }
    )
};



/**
     * Get Thing ID from bgg search call
     *
     * @param {Object} result
     * @return {{found: (boolean|boolean), thing_id: string}}
     */
export const getThingIdFromBGGSearch = (result: any): Search => {

    let searchItem: Search = {
        found: false,
        thing_id: ''
    }

    if (result.items instanceof Array) {
        if (result.items.length > 0) {
            searchItem.found = true;
            searchItem.thing_id = result.items[0].objectid;
        }
    }
    return searchItem;
}


/**
     * Send game embed to channel given thing_id
     */
export const searchEmbed = async (bggSearchResult: any, interaction: CommandInteraction<CacheType>) => {
    if(bggSearchResult.found) {
        // const result = await bggThing(bggSearchResult.thing_id);
        const result = await bggXmlApiClient.get('thing',  { id: bggSearchResult.thing_id, type: 'boardgame', stats: 1 });
        await interaction.reply({
            embeds: [itemToSearchEmbed(result.data.item,  interaction.member?.user)]
        });
    }
    else {
        await interaction.reply(`No results found for "${interaction.options.getString('name')}".`);
    }
}


/**
     * Create Discord Embed from BGG thing
     *
     * @param {Object} item
     * @return {module:"discord.js".MessageEmbed}
     */
const itemToSearchEmbed = (item:any, user:any) => {
    const 
        Discord = require('discord.js'),
        he = require('he'),
        title = item.name instanceof Array ? item.name[0].value : item.name.value,
        rank = item.statistics.ratings.ranks.rank instanceof Array ? item.statistics.ratings.ranks.rank[0].value : item.statistics.ratings.ranks.rank.value;
    return new Discord.MessageEmbed()
        .setColor('#3f3a60')
        .setTitle(`${title} (${item.yearpublished.value})`)
        .setURL(`https://boardgamegeek.com/${item.type}/${item.id}`)
        .setThumbnail(item.thumbnail)
        .setDescription(he.decode(item.description).substr(0, 250)+'...')
        .setAuthor({ name: user.username, url: user.avatarURL(), iconURL: user.displayAvatarURL() })
        .addFields(
            {
                name: ':trophy: Rank',
                value: rank,
                inline: true
            },
            {
                name: ':star: Rating',
                value: `${Math.floor(item.statistics.ratings.average.value * 100) / 100}`,
                inline: true
            },
            {
                name: ':game_die: Weight',
                value: `${Math.floor(item.statistics.ratings.averageweight.value * 100) / 100}`,
                inline: true
            },
            {
                name: ':hash: Players',
                value: `${item.minplayers.value} - ${item.maxplayers.value}`,
                inline: true
            },
            {
                name: ':hourglass: Playtime',
                value: `${item.playingtime.value} min`,
                inline: true
            },
            
        );
}

/**
     * Send game embed to channel given thing_id
     */
export const lookingForPlayerEmbed = async (bggSearchResult: any, interaction: CommandInteraction<CacheType>, game:string, time: string, players: string) => {
    if(bggSearchResult.found) {
        // const result = await bggThing(bggSearchResult.thing_id);
        const result = await bggXmlApiClient.get('thing',  { id: bggSearchResult.thing_id, type: 'boardgame', stats: 1 });
        await interaction.reply({
            embeds: [lookingForPlayerSearchEmbed(result.data.item,  interaction.member?.user, time, players)]
        });
    }
    else {
        const Discord = require('discord.js');
        time = time.includes('pm') ? time : time + 'pm';
        const embedMessage = new Discord.MessageEmbed()
        .setColor('#3f3a60')
        .setTitle(`:game_die: Game: ${game}`)
        .setDescription('Looking for players to play ' + game + ' on Thursday')
        .setAuthor({ name: interaction.user.username, url: interaction.user.avatarURL(), iconURL: interaction.user.displayAvatarURL() })
        .addFields(
            {
                name: ':hourglass: Start Time',
                value: time,
                inline: true
            },
            {
                name: ':hash: Players',
                value: players,
                inline: true
            },
        )
        await interaction.reply({
            embeds: [embedMessage]
        });
    }
}

/**
     * Create Discord Embed from BGG thing
     *
     * @param {Object} item
     * @return {module:"discord.js".MessageEmbed}
     */
const lookingForPlayerSearchEmbed = (item:any, user:any, time: string, players: string) => {
        const Discord = require('discord.js');
        const title = item.name instanceof Array ? item.name[0].value : item.name.value;
        time = time.includes('pm') ? time : time + 'pm';

    return new Discord.MessageEmbed()
        .setColor('#3f3a60')
        .setTitle(`${title} (${item.yearpublished.value})`)
        .setURL(`https://boardgamegeek.com/${item.type}/${item.id}`)
        .setDescription('Looking for players to play ' + title + ' on Thursday')
        .setThumbnail(item.thumbnail)
        .setAuthor({ name: user.username, url: user.avatarURL(), iconURL: user.displayAvatarURL() })
        .addFields(
            {
                name: ':hourglass: Start Time',
                value: time,
                inline: true
            },
            {
                name: ':hash: Players',
                value: players,
                inline: true
            }            
        );
}

const buttonReaction: any = () => {
    const Discord = require('discord.js');
    return new Discord.MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('add-player')
                    .setEmoji('✅')
					.setStyle('SECONDARY')
			);
}