const { SlashCommandBuilder } = require('@discordjs/builders');
const { Op } = require('sequelize');
const { Users, CurrencyShop } = require('../dbObjects.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('give an item to a user')
        .addStringOption(option =>
            option.setName('item')
            .setDescription('the item to give')
            .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
            .setDescription('the user to give the item to')
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('the amount of the item to give')
            .setRequired(false)),
        async execute(interaction) {
            // check if the user has the GM role
            if (!interaction.member.roles.cache.find(role => role.name === 'GM')) {
                return interaction.reply('You do not have the GM role.');
            }
            const item = CurrencyShop.findOne({ where: { name: { [Op.like]: interaction.options.getString('item') } } });
            if (!item) {
                return interaction.reply({ content: 'Can\'t find that item' });
            }
            const target = interaction.options.getUser('user');
            const user = await Users.findOne({ where: { user_id: target.id } });
            if (!user) {
                return interaction.reply({ content: 'Can\'t find that user' });
            }
            item.user_id = user.user_id;
            const amount = interaction.options.getInteger('amount') ?? 1;

            try {
                // give item to user for each amount
                for (let i = 0; i < amount; i++) {
                    await user.addItem(item);
                }
            }
            catch (err) {
                console.log(err);
                return interaction.reply({ content: 'Failed to give item to user', ephimeral: true });
            }
            return interaction.reply({ content: `You gave ${amount == 1 ? '' : amount} ${item.name} to ${interaction.options.getUser('user').username}`, ephimeral: true });
        },
};