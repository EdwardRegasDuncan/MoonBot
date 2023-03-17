const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('transfer Lunar Coins to another user')
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('the amount of Luna Coins to transfer')
            .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
            .setDescription('the user to transfer to')
            .setRequired(true)),
        async execute(interaction) {
            const senderBalance = interaction.client.currency.getBalance(interaction.user.id);
            const transferAmount = interaction.options.getInteger('amount');
            const target = interaction.options.getUser('user');

            if (transferAmount > senderBalance) {
                return interaction.reply('You don\'t have enough Luna Coins!');
            }
            if (transferAmount <= 0) {
                return interaction.reply('You must transfer at least 1 Luna Coin!');
            }
            try {
                // increase target balance and decrease sender balance
                interaction.client.currency.add(target.id, transferAmount);
                interaction.client.currency.add(interaction.user.id, -transferAmount);
            }
            catch (e) {
                console.error(e);
                return interaction.reply('There was an error transferring Luna Coins!');
            }
            return interaction.reply(`You have transferred ${transferAmount} Luna Coins to ${target.username}`);
        },
};