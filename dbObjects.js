const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Users = require('./models/users.js')(sequelize, Sequelize.DataTypes);
const CurrencyShop = require('./models/CurrencyShop.js')(sequelize, Sequelize.DataTypes);
const UserItems = require('./models/UserItems.js')(sequelize, Sequelize.DataTypes);

UserItems.belongsTo(CurrencyShop, { foreignKey: 'item_id', as : 'item' });

Reflect.defineProperty(Users.prototype, 'addItem', {
    value: async item => {
        const userItem = await UserItems.findOne({
            where: {
                user_id: item.user_id,
                item_id: item.id,
            },
        });
        if (userItem) {
            userItem.amount++;
            return userItem.save();
        }

        return UserItems.create({ user_id: item.user_id, item_id: item.id, amount: 1 });
    },
});

Reflect.defineProperty(Users.prototype, 'getItems', {
    value: async user => {
        return UserItems.findAll({
            where: { user_id: user.user_id },
            include: ['item'],
        });
    },
});

module.exports = { Users, CurrencyShop, UserItems };