const router = require('express').Router();
const {
	School,
	File,
	Education,
	Degree,
	User,
	Course,
	Major,
	Link,
	Rating,
} = require('../models');
const { upload } = require('../libraries/multer');
const fs = require('fs');
const passport = require('../libraries/passport');

const { body, matchedData, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../libraries/sequelize');
const { Sequelize } = require('../libraries/sequelize');

router.get('/', async (req, res) => {
	try {
		const schools = await School.findAll({
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
		});

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

			schools[index].set('rating', total);
		});

		return res.json(schools);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.get('/search', async (req, res) => {
	const params = {};
	for (const key in req.query) {
		const keyword = req.query[key];
		params[key] = Sequelize.where(
			Sequelize.fn('lower', Sequelize.col(`School.${key}`)),
			{
				[Op.substring]: keyword,
			}
		);
	}

	try {
		res.json(
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
		);
	} catch (error) {
		console.log(error);
		res.json([]);
	}
});

router.get('/:id', async (req, res) => {
	const id = req.params.id;
	try {
		return res.json(
			await School.findByPk(id, {
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
						include: Course,
					},
					User,
					Link,
				],
			})
		);
	} catch (error) {
		return res.status(500).json(error);
	}
});

router.post(
	'/',
	passport.authenticate('bearer', { session: false }),
	upload.fields([
		{ name: 'profile_picture', maxCount: 1 },
		{ name: 'cover_photo', maxCount: 1 },
	]),
	[
		body('region').notEmpty().bail().isString(),
		body('type').notEmpty().bail().isString(),
		body('district').notEmpty().bail().isString(),
		body('curricular_program').notEmpty().bail().isString(),
		body('mission').notEmpty().bail().isString(),
		body('vision').notEmpty().bail().isString(),
		body('province').notEmpty().bail().isString(),
		body('name').notEmpty().bail().isString(),
		body('address').notEmpty().bail().isString(),
		body('phone').notEmpty().bail().isNumeric(),
		body('email').notEmpty().bail().isString().bail().isEmail(),
		body('website').notEmpty().bail().isURL(),
	],
	async (req, res) => {
		const errors = validationResult(req).array();

		if (errors.length > 0) {
			return res.status(422).json({ errors });
		}

		try {
			const data = matchedData(req, { locations: ['body'] });

			const profilePicture = await File.process(
				req.files['profile_picture'][0],
				true
			);
			data.ProfilePictureId = profilePicture.id;

			const coverPhoto = await File.process(
				req.files['cover_photo'][0],
				true
			);
			data.CoverPhotoId = coverPhoto.id;

			data.UserId = req.user.id;

			const school = await School.create(data);

			return res.status(201).json(
				await School.findByPk(school.id, {
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
			);
		} catch (error) {
			if (req.files['profile_picture'].length > 0) {
				fs.unlinkSync(req.files['profile_picture'][0].path);
			}
			if (req.files['cover_photo'].length > 0) {
				fs.unlinkSync(req.files['cover_photo'][0].path);
			}
			console.log(error);
			res.status(500).json(error);
		}
	}
);

router.put(
	'/:id',
	passport.authenticate('bearer', { session: false }),
	upload.fields([
		{ name: 'profile_picture', maxCount: 1 },
		{ name: 'cover_photo', maxCount: 1 },
	]),
	[
		body('region').notEmpty().bail().isString().bail().optional(),
		body('type').notEmpty().bail().isString().bail().optional(),
		body('district').notEmpty().bail().isString().bail().optional(),
		body('curricular_program').notEmpty().bail().isString().optional(),
		body('mission').notEmpty().bail().isString().optional(),
		body('vision').notEmpty().bail().isString().optional(),
		body('province').notEmpty().bail().isString().bail().optional(),
		body('name').notEmpty().bail().isString().bail().optional(),
		body('address').notEmpty().bail().isString().bail().optional(),
		body('phone').notEmpty().bail().isNumeric().bail().optional(),
		body('email')
			.notEmpty()
			.bail()
			.isString()
			.bail()
			.isEmail()
			.bail()
			.optional(),
		body('website').notEmpty().bail().isURL().bail().optional(),
		body('preschool').notEmpty().bail().optional(),
		body('elementary').notEmpty().bail().optional(),
		body('shs').notEmpty().bail().optional(),
	],
	async (req, res) => {
		const errors = validationResult(req).array();
		const id = req.params.id;

		if (errors.length > 0) {
			return res.status(422).json({ errors });
		}

		try {
			const data = matchedData(req, { locations: ['body'] });

			const school = await School.findByPk(id, {
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
			});

			if (!school) {
				return res.sendStatus(404);
			}

			if ('profile_picture' in req.files) {
				const profilePicture = await File.process(
					req.files['profile_picture'][0],
					true
				);
				data.ProfilePictureId = profilePicture.id;
				school.ProfilePicture.destroy();
				school.set('ProfilePicture', profilePicture);
			}

			if ('cover_photo' in req.files) {
				const coverPhoto = await File.process(
					req.files['cover_photo'][0],
					true
				);
				data.CoverPhotoId = coverPhoto.id;
				school.CoverPhoto.destroy();
				school.set('CoverPhoto', coverPhoto);
			}

			school.update(data);

			return res.json(school);
		} catch (error) {
			if (req.files) {
				Object.values(req.files).forEach((files) => {
					files.forEach((file) => fs.unlinkSync(file.path));
				});
			}
			console.log(error);
			res.status(500).json(error);
		}
	}
);

router.delete(
	'/:id',
	passport.authenticate('bearer', { session: false }),
	async (req, res) => {
		const id = req.params.id;
		try {
			const school = await School.findByPk(id);
			if (school) {
				school.destroy();
			}
			return res.sendStatus(204);
		} catch (error) {
			console.log(error);
			return res.status(500).json(error);
		}
	}
);

module.exports = router;
