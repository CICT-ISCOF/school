const router = require('express').Router();
const {
	School,
	Degree,
	File,
	Course,
	Major,
	Education,
	User,
} = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../libraries/sequelize');
const { Sequelize } = require('../libraries/sequelize');

router.get('/schools', async (req, res) => {
	const params = {};
	if (!('query' in req.query)) {
		return res.status(422).json({
			message: 'Query is required.',
		});
	}
	const schoolKeys = ['region', 'district', 'province', 'name', 'address'];
	const query = req.query.query;

	schoolKeys.forEach((key) => {
		params[key] = Sequelize.or(
			Sequelize.fn('lower', Sequelize.col(`School.${key}`)),
			{
				[Op.substring]: query,
			}
		);
	});

	const schools = await School.findAll({
		where: params,
		include: [
			{
				model: File,
				as: 'ProfilePicture',
			},
			{
				model: File,
				as: 'CoverPhoto',
			},
			Education,
			{
				model: Degree,
				include: [
					{
						model: Course,
						include: Major,
					},
				],
			},
			User,
		],
	});

	const degrees = await Degree.findAll({
		where: {
			name: {
				[Op.substring]: query,
			},
		},
		include: [
			{
				model: School,
				include: [
					{
						model: File,
						as: 'ProfilePicture',
					},
					{
						model: File,
						as: 'CoverPhoto',
					},
					Education,
					{
						model: Degree,
						include: [
							{
								model: Course,
								include: Major,
							},
						],
					},
					User,
				],
			},
		],
	});

	const majors = await Major.findAll({
		where: {
			title: {
				[Op.substring]: query,
			},
		},
		include: [
			{
				model: Course,
				include: [
					{
						model: Degree,
						include: [
							{
								model: School,
								include: [
									{
										model: File,
										as: 'ProfilePicture',
									},
									{
										model: File,
										as: 'CoverPhoto',
									},
									Education,
									{
										model: Degree,
										include: [
											{
												model: Course,
												include: Major,
											},
										],
									},
									User,
								],
							},
						],
					},
				],
			},
		],
	});

	degrees.forEach((degree) => schools.push(degree.School));
	majors.forEach((major) => schools.push(major.Course.Degree.School));

	if (
		'type' in req.query &&
		['Both', 'Public', 'Private'].includes(req.query.type)
	) {
		return res.json(
			schools.filter((school) => school.type === req.query.type)
		);
	}

	try {
		res.json(schools);
	} catch (error) {
		console.log(error);
		res.json([]);
	}
});

module.exports = router;
