const router = require('express').Router();
const { Major, File, Education, Degree, School, Course } = require('../models');
const { upload } = require('../libraries/multer');
const fs = require('fs');
const passport = require('../libraries/passport');

const { body, matchedData, validationResult } = require('express-validator');

router.get('/', async (req, res) => {
	try {
		res.json(
			await Major.findAll({
				include: [
					{
						model: Course,
						include: [
							{
								model: Degree,
								include: [
									{
										model: School,
										include: [File, Education],
									},
								],
							},
						],
					},
				],
			})
		);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.get('/:id', async (req, res) => {
	const id = req.params.id;
	try {
		return res.json(
			await Major.findByPk(id, {
				include: [
					{
						model: Course,
						include: [
							{
								model: Degree,
								include: [
									{
										model: School,
										include: [File, Education],
									},
								],
							},
						],
					},
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
	[
		body('title').notEmpty().bail().isString(),
		body('CourseId')
			.notEmpty()
			.bail()
			.isNumeric()
			.bail()
			.custom(async (id) => {
				try {
					const course = await Course.findByPk(id);
					if (!course) {
						return Promise.reject('Invalid Course ID.');
					}
					return id;
				} catch (error) {
					console.log(error);
					return Promise.reject('Unable to verify Course ID.');
				}
			}),
	],
	async (req, res) => {
		const errors = validationResult(req).array();

		if (errors.length > 0) {
			return res.status(422).json({ errors });
		}

		try {
			const data = matchedData(req, { locations: ['body'] });

			const major = await Major.create(data);

			return res.status(201).json(major);
		} catch (error) {
			console.log(error);
			res.status(500).json(error);
		}
	}
);

router.put(
	'/:id',
	passport.authenticate('bearer', { session: false }),
	[
		body('title').notEmpty().bail().isString().bail().optional(),
		body('CourseId')
			.notEmpty()
			.bail()
			.isNumeric()
			.bail()
			.custom(async (id) => {
				try {
					const course = await Course.findByPk(id);
					if (!course) {
						return Promise.reject('Invalid Course ID.');
					}
					return id;
				} catch (error) {
					console.log(error);
					return Promise.reject('Unable to verify Course ID.');
				}
			})
			.optional(),
	],
	async (req, res) => {
		const errors = validationResult(req).array();
		const id = req.params.id;

		if (errors.length > 0) {
			return res.status(422).json({ errors });
		}

		try {
			const data = matchedData(req, { locations: ['body'] });

			const major = await Major.findByPk(id);

			if (!major) {
				return res.sendStatus(404);
			}

			major.update(data);

			return res.json(major);
		} catch (error) {
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
			const major = await Major.findByPk(id);
			if (major) {
				major.destroy();
			}
			return res.sendStatus(204);
		} catch (error) {
			console.log(error);
			return res.status(500).json(error);
		}
	}
);

module.exports = router;
