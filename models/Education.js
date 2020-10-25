const { DataTypes } = require('sequelize');
const sequelize = require('../libraries/sequelize');

const Model = sequelize.define('Education', {
	type: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	tuition: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	date_of_examination: {
		type: DataTypes.DATE,
		allowNull: true,
		default: null,
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
});

Model.associate = ({ School }) => {
	Model.belongsTo(School);
};

Model.registerEvents = (models) => {};

module.exports = Model;
