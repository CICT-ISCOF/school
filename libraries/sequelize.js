const { Sequelize } = require('sequelize');

const host = process.env.DB_HOST;
const dialect = process.env.DB_CONNECTION;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const port = process.env.DB_PORT;
const database = process.env.DB_DATABASE;

const sequelize = new Sequelize(database, username, password, {
	dialect,
	host,
	port,
	define: {
		charset: 'utf8',
		collate: 'utf8_general_ci',
	},
});

(async () => {
	try {
		await sequelize.authenticate();
	} catch (error) {
		console.log(error.toJSON());
	}
})();

module.exports = sequelize;
