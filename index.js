const fs = require('node:fs');
const path = require('node:path');
const { Client, Intents, Collection } = require('discord.js');
const { TOKEN } = require('./config.json');
const { Users } = require('./dbObjects.js');

// Create an instance of a Discord client
const client = new Client({ intents: [ Intents.FLAGS.GUILDS,
                                       Intents.FLAGS.GUILD_MESSAGES,
                                       Intents.FLAGS.GUILD_MESSAGE_REACTIONS ] });

client.currency = new Collection();

Reflect.defineProperty(client.currency, 'add', {
    value: async (id, amount) => {
        const user = client.currency.get(id);
        if (user) {
            user.balance += Number(amount);
            return user.save();
        }

        const newUser = await Users.create({ user_id: id, balance: amount });
        client.currency.set(id, newUser);

        return newUser;
    },
});

Reflect.defineProperty(client.currency, 'getBalance', {
    value: id => {
        const user = client.currency.get(id);
        return user ? user.balance : 0;
    },
});


// setup commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
    console.log(`Loaded command: ${command.data.name}`);
}

// setup events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
        console.log(`Loaded event: ${event.name}`);
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
        console.log(`Loaded event: ${event.name}`);
    }
}

// Login to Discord with your app's token
client.login(TOKEN);