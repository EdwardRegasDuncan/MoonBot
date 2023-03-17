const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your inventory or check someone else\'s inventory')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('the user to check the inventory of')),
        async execute(interaction) {
            const { Users } = require('../dbObjects.js');
            const target = interaction.options.getUser('user') ?? interaction.user;
            const user = await Users.findOne({ where: { user_id: target.id } });
            if (!user) {
                return interaction.reply(`<@${interaction.user.id}> has no items!`);
            }
            if (!user.user_id) {
                return interaction.reply(`There was an error looking up ${target.name}'s inventory`);
            }
            const items = await user.getItems(user);

            if (!items.length) {
                return interaction.reply(`<@${target.id}> has no items!`);
            }

            return interaction.reply(`<@${target.id}> has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
        },
};