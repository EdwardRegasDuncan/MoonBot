module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        // sync user balance from database
        const { Users } = require('../dbObjects.js');
        const storedBalances = await Users.findAll();
        storedBalances.forEach(b => client.currency.set(b.user_id, b));

        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};