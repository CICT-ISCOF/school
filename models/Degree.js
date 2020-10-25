const { DataTypes } = require('sequelize');
const sequelize = require('../libraries/sequelize');

const Model = sequelize.define('Degree', {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	type: {
		type: DataTypes.ENUM(['Bachelor', 'Master', 'PhD']),
	},
});

Model.associate = ({ School }) => {
	Model.belongsTo(School);
};

module.exports = Model;
