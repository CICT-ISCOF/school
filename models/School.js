const { DataTypes } = require('sequelize');
const sequelize = require('../libraries/sequelize');

const Model = sequelize.define('School', {
	region: {
		type: DataTypes.ENUM(['Preschool', 'Elementary', 'Secondary', 'SHS']),
		allowNull: false,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	address: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	phone: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	website: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

Model.associate = ({ Degree, File, Education, User }) => {
	Model.hasMany(Degree);
	Model.hasMany(Education);
	Model.belongsTo(File);
	Model.belongsTo(User);
};

module.exports = Model;
