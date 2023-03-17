module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;
        // check if message is in a channel with the user's name
        if (message.channel.name === message.author.username.toLowerCase()) {
            if (message.content.startsWith('-')) {
                message.client.currency.add(message.author.id, 1);
                console.log(`${message.author.tag} has ${message.client.currency.getBalance(message.author.id)} Luna Coins`);
            }
        }
    },
};