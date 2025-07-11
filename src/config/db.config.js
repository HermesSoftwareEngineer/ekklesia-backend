const { Sequelize } = require("sequelize");

require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

module.exports = sequelize;