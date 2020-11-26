const { DataTypes } = require('sequelize');
const sequelize = require('../libraries/sequelize');

const Model = sequelize.define('Rating', {
	ip_address: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	message: {
		type: DataTypes.TEXT,
		allowNull: true,
	},
	rating: {
		type: DataTypes.INTEGER,
	},
});

Model.associate = ({ School }) => {
	Model.belongsTo(School);
};

Model.registerEvents = (models) => {};

module.exports = Model;
