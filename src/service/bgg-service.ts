import { Search } from "../interfaces/search-model";

import { request } from 'undici'
import bggXmlApiClient from "bgg-xml-api-client";

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
export const searchEmbed = async (bggSearchResult: any, interaction: any) => {
    if(bggSearchResult.found) {
        // const result = await bggThing(bggSearchResult.thing_id);
        const result = await bggXmlApiClient.get('thing',  { id: bggSearchResult.thing_id });
        await interaction.reply({
            embeds: [itemToSearchEmbed(result.data.item,  interaction.member.user)]
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
        title = item.name instanceof Array ? item.name[0].value : item.name.value;
    return new Discord.MessageEmbed()
        .setColor('#3f3a60')
        .setTitle(`${title} (${item.yearpublished.value})`)
        .setURL(`https://boardgamegeek.com/${item.type}/${item.id}`)
        .setThumbnail(item.thumbnail)
        .setDescription(he.decode(item.description).substr(0, 250)+'...')
        .setAuthor({ name: user.username, url: user.avatarURL(), iconURL: user.displayAvatarURL() })
        .addFields(
            {
                name: ':hash: Number of Players',
                value: `${item.minplayers.value} - ${item.maxplayers.value}`,
                inline: true
            },
            {
                name: ':hourglass: Average Playtime',
                value: `${item.playingtime.value} min`,
                inline: true
            },
        );
}