const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcoins')
        .setDescription('add coins to a user\'s account')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('the user to add coins to')
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('the amount of coins to add')
            .setRequired(true)),
        async execute(interaction) {
            if (!interaction.member.roles.cache.find(role => role.name === 'GM')) {
                return interaction.reply('You do not have the GM role.');
            }
            const target = interaction.options.getUser('user');
            try {
                interaction.client.currency.add(interaction.options.getUser('user').id, interaction.options.getInteger('amount'));
            }
            catch (e) {
                console.error(e);
                return interaction.reply('There was an error adding coins!');
            }
            return interaction.reply(`Added ${interaction.options.getInteger('amount')} coins to ${target.username}'s account.`);
        },
};