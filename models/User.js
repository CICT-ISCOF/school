const { DataTypes } = require('sequelize');
const sequelize = require('../libraries/sequelize');

const Model = sequelize.define('User', {
	username: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	type: {
		type: DataTypes.ENUM(['Admin', 'School Admin']),
		allowNull: false,
	},
});

Model.associate = ({ Token }) => {
	Model.hasMany(Token);
};

module.exports = Model;
