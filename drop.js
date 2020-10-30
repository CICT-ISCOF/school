const server = require('./server');
server.on('listening', () => {});

const sequelize = require('./libraries/sequelize');

sequelize.sync().then(() => {
	sequelize.drop();
});

process.exit(0);
