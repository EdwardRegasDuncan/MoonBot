const { SlashCommandBuilder } = require('@discordjs/builders');
const { Op } = require('sequelize');
const { Users, CurrencyShop } = require('../dbObjects.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('buy an item from the shop')
        .addStringOption(option =>
            option.setName('item')
            .setDescription('the item to buy')
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('the amount to buy')
            .setRequired(false)),
        async execute(interaction) {
            const itemName = String(interaction.options.getString('item'));
            const amount = Number(interaction.options.getInteger('amount'));
            const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });
            if (item.hidden) {
                return interaction.reply('You can\'t buy that item');
            }
            const itemCost = item.cost * (amount || 1);
            if (!item) {
                return interaction.reply({ content: 'Can\'t find that item' });
            }
            if (itemCost > interaction.client.currency.getBalance(interaction.user.id)) {
                return interaction.reply({ content: `You're short ${itemCost - interaction.client.currency.getBalance(interaction.user.id)} Luna Coins`, ephimeral: true });
            }
            const user = await Users.findOne({ where: { user_id: interaction.user.id } });
            interaction.client.currency.add(interaction.user.id, -itemCost);
            item.user_id = interaction.user.id;
            for (let i = 0; i < amount; i++) {
                await user.addItem(item);
            }

            return interaction.reply({ content: `You bought ${amount == 1 ? '' : amount} ${item.name} for ${itemCost} Luna Coins` });
        },
};