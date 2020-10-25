require('./server');
const sequelize = require('./libraries/sequelize');

Object.values(sequelize.models).forEach((model) => {
	model.drop().catch(() => {});
});

sequelize
	.sync()
	.catch((error) => {})
	.finally(() => process.exit(0));
