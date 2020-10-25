const { DataTypes } = require('sequelize');
const sequelize = require('../libraries/sequelize');

const Model = sequelize.define('Major', {
	title: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
});

Model.associate = ({ Course }) => {
	Model.belongsTo(Course);
};

Model.registerEvents = (models) => {};

module.exports = Model;
