const { SlashCommandBuilder } = require('@discordjs/builders');
const { CurrencyShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeshopitem')
        .setDescription('remove an item from the shop')
        .addStringOption(option =>
            option.setName('item')
            .setDescription('the item to remove')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('confirm')
            .setDescription('Type CONFIRM to confirm')
            .setRequired(true)),
        async execute(interaction) {
            if (!interaction.options.getString('confirm') === 'CONFIRM') {
                return interaction.reply('Please confirm by typing CONFIRM');
            }

            // check if the user has the GM role
            if (!interaction.member.roles.cache.find(role => role.name === 'GM')) {
                return interaction.reply('You do not have the GM role.');
            }

            // remove the item from the shop
            const item = String(interaction.options.getString('item'));
            const rowCount = await CurrencyShop.destroy({ where: { name: { [Op.like]: item } } });
            if (rowCount === 0) {
                return interaction.reply(`${item} is not in the shop`);
            }
            return interaction.reply(`${item} removed from shop`);

        },
};