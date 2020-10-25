const { DataTypes } = require('sequelize');
const sequelize = require('../libraries/sequelize');

const Model = sequelize.define('Course', {
	title: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	tuition: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

Model.associate = ({ Degree, Major }) => {
	Model.belongsTo(Degree);
	Model.hasMany(Major);
};

Model.registerEvents = ({ Major }) => {
	Model.beforeDestroy(async (course) => {
		const majors = await Major.findAll({
			where: {
				CourseId: course.id,
			},
		});
		majors.forEach((major) => major.destroy());
	});
};

module.exports = Model;
