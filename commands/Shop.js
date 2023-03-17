const { SlashCommandBuilder } = require('@discordjs/builders');
const { CurrencyShop } = require('../dbObjects.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('view the shop'),
        async execute(interaction) {
            const items = await CurrencyShop.findAll();
            // check if interaction.author has the GM role
            const isGM = interaction.member.roles.cache.find(role => role.name === 'GM');
            const embed = {
                title: 'Shop',
                description: `A collection of items to improve your character\n 
                            you currently have ${interaction.client.currency.getBalance(interaction.user.id)} Lunar Coins`,
                fields: [],
            };
            for (const item of items) {
                if (!item.hidden || isGM) {
                    embed.fields.push({
                        name: `${item.name} - [${item.cost} Lc]`,
                        value: `${item.description || `A ${item.name}`}`,
                    });
                }
            }
            return interaction.reply({ embeds: [embed] });
        },
};