const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('get your balance or check someone else\'s balance')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('the user to check the balance of')),
        async execute(interaction) {
            const target = interaction.options.getUser('user') ?? interaction.user;
            return interaction.reply(`<@${target.id}> has ${interaction.client.currency.getBalance(target.id)} Lunar Coins`);
        },
};
