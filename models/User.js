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

Model.associate = ({ Token, School }) => {
	Model.hasMany(Token);
	Model.hasMany(School);
};

Model.registerEvents = ({ Token }) => {
	Model.beforeDestroy(async (user) => {
		const tokens = await Token.findAll({
			where: {
				UserId: user.id,
			},
		});
		tokens.forEach((token) => token.destroy());
	});
};

module.exports = Model;
