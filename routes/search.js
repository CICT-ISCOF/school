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
	const schools = [];
	if ('school' in req.query) {
		const schoolKeys = [
			'region',
			'district',
			'province',
			'name',
			'address',
		];
		const query = req.query.query;
		const params = {};
		schoolKeys.forEach((key) => {
			params[key] = Sequelize.or(
				Sequelize.fn('lower', Sequelize.col(`School.${key}`)),
				{
					[Op.substring]: query,
				}
			);
		});

		(
			await School.findAll({
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
			})
		).forEach((school) => schools.push(school));
	}

	if ('degree' in req.query) {
		const degree = req.query.degree;
		const degrees = await Degree.findAll({
			where: {
				name: {
					[Op.substring]: degree,
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

		degrees.forEach((degree) => schools.push(degree.School));
	}

	if ('major' in req.query) {
		const majors = await Major.findAll({
			where: {
				title: {
					[Op.substring]: req.query.major,
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

		majors.forEach((major) => schools.push(major.Course.Degree.School));
	}

	if ('course' in req.query) {
		const courses = await Course.findAll({
			where: {
				title: {
					[Op.substring]: req.query.course,
				},
			},
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
		});

		courses.forEach((course) => schools.push(course.Degree.School));
	}

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
