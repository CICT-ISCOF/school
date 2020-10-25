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
	description: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
});

Model.associate = ({ School, Course }) => {
	Model.belongsTo(School);
	Model.hasMany(Course);
};

Model.registerEvents = ({ Course }) => {
	Model.beforeDestroy(async (degree) => {
		const courses = await Course.findAll({
			where: {
				DegreeId: degree.id,
			},
		});
		courses.forEach((course) => course.destroy());
	});
};

module.exports = Model;
