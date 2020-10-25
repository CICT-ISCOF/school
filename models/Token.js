const { DataTypes } = require('sequelize');
const sequelize = require('../libraries/sequelize');

const Model = sequelize.define('Token', {
	hash: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

Model.associate = ({ User }) => {
	Model.belongsTo(User);
};

module.exports = Model;
