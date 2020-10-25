const sequelize = require('../libraries/sequelize');

if (process.env.ENV !== 'production') {
	sequelize.sync();
}

const models = {
	Degree: require('./Degree'),
	Education: require('./Education'),
	File: require('./File'),
	School: require('./School'),
	User: require('./User'),
	Token: require('./Token'),
};

Object.values(models).forEach((model) => {
	model.associate(models);
});

models.School.beforeDestroy((school) => {
	models.Degree.destroy({
		where: {
			SchoolId: school.id,
		},
	});
	models.Education.destroy({
		where: {
			SchoolId: school.id,
		},
	});
});

models.School.afterDestroy(async (school) => {
	const file = await models.File.findByPk(school.FileId);
	file.destroy();
});

models.User.beforeDestroy(async (user) => {
	const schools = await models.School.findAll({
		where: {
			UserId: user.id,
		},
	});
	schools.forEach((school) => school.destroy());
});

module.exports = models;
