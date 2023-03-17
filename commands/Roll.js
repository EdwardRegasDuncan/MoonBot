const { SlashCommandBuilder } = require('@discordjs/builders');
const { Op } = require('sequelize');
const { CurrencyShop, UserItems } = require('../dbObjects.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('roll a dice')
        .addStringOption(option =>
            option.setName('quantity')
            .setDescription('the number of dice to roll')
            .setRequired(false))
        .addStringOption(option =>
            option.setName('sides')
            .setDescription('the number of sides on the dice')
            .setRequired(false))
        .addStringOption(option =>
            option.setName('modifier')
            .setDescription('a number or item to improve the roll')),
        async execute(interaction) {
            const quantity = Number(interaction.options.getString('quantity')) || 1;
            const sides = Number(interaction.options.getString('sides')) || 20;
            const itemName = interaction.options.getString('modifier') || null;
            // check if mofifier is a number
            const modifier = Number(itemName);

            if (isNaN(quantity) || isNaN(sides)) {
                return interaction.reply('Please enter a valid number');
            }
            if (quantity > 100 || sides > 100) {
                return interaction.reply('Please enter a number less than 100');
            }
            if (quantity < 1 || sides < 1) {
                return interaction.reply('Please enter a number greater than 0');
            }
            const dice = [];
            let total = 0;
            for (let i = 0; i < quantity; i++) {
                const roll = Math.floor(Math.random() * sides) + 1;
                total += roll;
                dice.push(roll);
            }
            if (itemName) {
                if (isNaN(modifier)) {
                    const itemObj = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });
                    if (!itemObj) {
                        return interaction.reply(`${itemName} does not exist`);
                    }
                    const item = await UserItems.findOne({ where: { item_id: itemObj.id, user_id: interaction.user.id } });
                    if (!item) {
                        return interaction.reply(`You do not have ${itemObj.name}`);
                    }
                    return interaction.reply(quantity < 2 ?
                        `You rolled a ${total} using ${item.amount} ${itemObj.name}${item.amount == 1 ? '' : '\'s'} for a total of: ${total + item.amount}` :
                        `You rolled ${dice.join(', ')}\n 
                        for a total of ${total}\n 
                        using ${item.amount} ${itemObj.name}${item.amount == 1 ? '' : '\'s'}\n 
                        for a total of: ${total + item.amount}`);
                }
                else {
                    return interaction.reply(quantity < 2 ?
                        `You rolled a ${total} with ${modifier} for a total of: ${total + modifier}` :
                        `You rolled ${dice.join(', ')}\n 
                        for a total of ${total}\n 
                        with ${modifier}\n 
                        for a total of: ${total + modifier}`);
                }
            }
            return interaction.reply(quantity < 2 ? `You rolled a ${total}` : `You rolled:\n ${dice.join(', ')}\n for a total of ${total}`);
        },
};