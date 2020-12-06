const { DataTypes } = require('sequelize');
const sequelize = require('../libraries/sequelize');

const Model = sequelize.define('Link', {
	url: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
});

Model.associate = ({ School }) => {
	Model.belongsTo(School);
};

Model.registerEvents = (models) => {};

module.exports = Model;
