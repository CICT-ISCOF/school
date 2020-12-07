const router = require('express').Router();
const {
	School,
	Degree,
	File,
	Course,
	Major,
	Education,
	User,
	Link,
	Rating,
} = require('../models');
const { Op } = require('sequelize');
const { Sequelize } = require('../libraries/sequelize');

router.get('/schools', async (req, res) => {
	try {
		const schools = [];
		if ('address' in req.query) {
			(
				await School.findAll({
					where: {
						address: {
							[Op.substring]: req.query.address,
						},
					},
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
						Link,
					],
				})
			).forEach((school) => schools.push(school));
		}

		if ('region' in req.query) {
			(
				await School.findAll({
					where: {
						region: {
							[Op.substring]: req.query.region,
						},
					},
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
						Link,
					],
				})
			).forEach((school) => schools.push(school));
		}

		if ('address' in req.query) {
			(
				await School.findAll({
					where: {
						address: {
							[Op.substring]: req.query.address,
						},
					},
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
						Link,
					],
				})
			).forEach((school) => schools.push(school));
		}

		if ('province' in req.query) {
			(
				await School.findAll({
					where: {
						province: {
							[Op.substring]: req.query.province,
						},
					},
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
						Link,
					],
				})
			).forEach((school) => schools.push(school));
		}

		if ('school' in req.query) {
			const schoolKeys = ['district', 'name'];
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
						Link,
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
							Link,
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
											Link,
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
									Link,
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

		const promises = [];

		schools.forEach((school) =>
			promises.push(
				Rating.findAll({
					where: {
						SchoolId: school.id,
					},
				})
			)
		);

		const schoolRatings = await Promise.all(promises);

		schoolRatings.forEach((ratings, index) => {
			const totals = [0, 0, 0, 0, 0];

			ratings.forEach((rating) => {
				totals[rating.rating - 1] += 1;
			});

			const all = totals.reduce((prev, next) => prev + next);

			const average = totals
				.map((rate, index) => (index + 1) * rate)
				.reduce((prev, next) => prev + next);

			const result = Number(average / all ? average / all : 0);

			const total = Number.isInteger(result)
				? result
				: Number(result).toFixed(1);

			schools[index] = schools[index].toJSON();
			schools[index]['ratings'] = total;
		});

		return res.json(schools);
	} catch (error) {
		console.log(error);
		res.json([]);
	}
});

module.exports = router;
