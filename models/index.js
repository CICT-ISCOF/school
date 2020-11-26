const sequelize = require('../libraries/sequelize');

if (process.env.ENV !== 'production') {
	sequelize.sync();
}

const models = {
	Course: require('./Course'),
	Degree: require('./Degree'),
	Education: require('./Education'),
	File: require('./File'),
	Major: require('./Major'),
	Rating: require('./Rating'),
	School: require('./School'),
	User: require('./User'),
	Token: require('./Token'),
};

Object.values(models).forEach((model) => {
	model.associate(models);
	model.registerEvents(models);
});

module.exports = models;
