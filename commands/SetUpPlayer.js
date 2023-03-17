const { SlashCommandBuilder } = require('@discordjs/builders');
const GUILD_CATEGORY = 4;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupplayer')
        .setDescription('Sets up a player with a channel and a role')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to set up')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('game')
            .setDescription('Which game to add the user to')
            .setRequired(true)),
        async execute(interaction) {
            // setup player with a custom role, text channel and bot command channel under a channel category
            const member = interaction.options.getUser('user') ?? interaction.member.user;
            // check if guild has role with user's name
            let userRole = interaction.guild.roles.cache.find(r => r.name === member.user.username);
            if (!userRole) {
                userRole = await interaction.guild.roles.create({ name: member.user.username, color: 'BLUE' });
            }
            // check if user has role and add it if they don't
            if (!member.roles.cache.some(r => r.id === userRole.id)) {
                await member.roles.add(userRole);
            }
            // check if game category exists and create it if it doesn't
            let gameCategory = interaction.guild.channels.cache.find(c => c.name === interaction.options.getString('game'));
            if (!gameCategory) {
                gameCategory = await interaction.guild.channels.create(interaction.options.getString('game'), { type: GUILD_CATEGORY });
            }
            // check if gameCategory has a text channel with user's name
            let playerChannel = interaction.guild.channels.cache.find(c => c.name === member.user.username && c.parentID === gameCategory.id);
            if (!playerChannel) {
                playerChannel = await interaction.guild.channels.create(member.user.username, { type: 'text', parent: gameCategory });
                await playerChannel.permissionOverwrites.create(userRole, { VIEW_CHANNEL: true, SEND_MESSAGES: true, READ_MESSAGE_HISTORY: true });
                await playerChannel.permissionOverwrites.create(interaction.guild.roles.everyone, { VIEW_CHANNEL: false, SEND_MESSAGES: false, READ_MESSAGE_HISTORY: false });
                // greet player and tell them the rules
                await playerChannel.send(`Your Adventure Begins, ${member.user.username}!`);
                await playerChannel.send('Use a dash (-) to signify the end of your turn.\n As you play you will earn Lunar Coins, you can spend these to purchase items for your character (/shop).');
            }

            // check if gameCategory has a out-of-character channel
            let botCommandChannel = interaction.guild.channels.cache.find(c => c.name === 'out-of-character' && c.parentID === gameCategory.id);
            if (!botCommandChannel) {
                botCommandChannel = await interaction.guild.channels.create('out-of-character', { type: 'text', parent: gameCategory });
                await botCommandChannel.permissionOverwrites.create(userRole, { VIEW_CHANNEL: true, SEND_MESSAGES: true, READ_MESSAGE_HISTORY: true });
                await botCommandChannel.permissionOverwrites.create(interaction.guild.roles.everyone, { VIEW_CHANNEL: false, SEND_MESSAGES: false, READ_MESSAGE_HISTORY: false });
                await botCommandChannel.send('Please use this channel for questions and bot commands. (you can still use /roll in the main chat)');
            }

            return interaction.reply(`${member.user.username} has been set up!`);
        },
};