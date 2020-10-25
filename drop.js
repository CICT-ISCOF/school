require('./server');
const sequelize = require('./libraries/sequelize');

sequelize
	.dropAllSchemas()
	.catch(() => {})
	.finally(() => process.exit(0));
