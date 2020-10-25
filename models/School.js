const { DataTypes } = require('sequelize');
const sequelize = require('../libraries/sequelize');

const Model = sequelize.define('School', {
	region: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	type: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	district: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	province: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	curricular_program: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	mission: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	vision: {
		type: DataTypes.TEXT,
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
	Model.belongsTo(File, {
		as: 'ProfilePicture',
		foreignKey: 'ProfilePictureId',
	});
	Model.belongsTo(File, { as: 'CoverPhoto', foreignKey: 'CoverPhotoId' });
	Model.belongsTo(User);
};

Model.registerEvents = ({ Degree, Education, File }) => {
	Model.afterDestroy(async (school) => {
		const profilePicture = await File.findByPk(school.ProfilePictureId);
		profilePicture.destroy();

		const coverPhoto = await File.findByPk(school.CoverPhotoId);
		coverPhoto.destroy();
	});

	Model.beforeDestroy(async (school) => {
		const degrees = await Degree.findAll({
			where: {
				SchoolId: school.id,
			},
		});
		degrees.forEach((degree) => degree.destroy());

		const education = await Education.findAll({
			where: {
				SchoolId: school.id,
			},
		});

		education.forEach((education) => education.destroy());
	});
};

module.exports = Model;
