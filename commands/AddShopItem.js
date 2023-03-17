const { SlashCommandBuilder } = require('@discordjs/builders');
const Sequelize = require('sequelize');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addshopitem')
        .setDescription('add an item to the shop')
        .addStringOption(option =>
            option.setName('item')
            .setDescription('the item to add')
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName('cost')
            .setDescription('the cost of the item')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
            .setDescription('the description of the item')
            .setRequired(false))
        .addBooleanOption(option =>
            option.setName('hidden')
            .setDescription('whether or not the item appears in the shop')
            .setRequired(false)),
        async execute(interaction) {
            // check if the user has the GM role
            if (!interaction.member.roles.cache.find(role => role.name === 'GM')) {
                return interaction.reply('You do not have the GM role.');
            }

            const item = {
                name: interaction.options.getString('item'),
                cost: interaction.options.getInteger('cost'),
                description: interaction.options.getString('description') ?? '',
                hidden: interaction.options.getBoolean('hidden') ?? false,
            };

            // Setup Connection information
            const sequelize = new Sequelize('database', 'username', 'password', {
                host: 'localhost',
                dialect: 'sqlite',
                logging: false,
                storage: 'database.sqlite',
            });

            // Get models
            const CurrencyShop = require('../models/CurrencyShop.js')(sequelize, Sequelize.DataTypes);
            require('../models/users.js')(sequelize, Sequelize.DataTypes);
            require('../models/UserItems.js')(sequelize, Sequelize.DataTypes);

            // Setup CurrencyShop
            const FORCE = false;
            sequelize.sync({ FORCE }).then(async () => {
                const shop = [
                    CurrencyShop.upsert(item),
                ];

                await Promise.all(shop);
                console.log('Database synced');
                sequelize.close();
                return interaction.reply({ content: `${item.name} added to shop for ${item.cost} Lunar Coins` });
            }).catch(console.error);
        },
};