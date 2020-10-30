const router = require('express').Router();
const { Course, Degree, Major } = require('../models');
const passport = require('../libraries/passport');

const { body, matchedData, validationResult } = require('express-validator');

router.get('/', async (req, res) => {
	try {
		res.json(
			await Course.findAll({
				include: Major,
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
			await Course.findByPk(id, {
				include: Major,
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
		body('tuition').notEmpty().bail().isString(),
		body('description').notEmpty().bail().isString(),
		body('DegreeId')
			.notEmpty()
			.bail()
			.isNumeric()
			.bail()
			.custom(async (id) => {
				try {
					const degree = await Degree.findByPk(id);
					if (!degree) {
						return Promise.reject('Invalid Degree ID.');
					}
					return id;
				} catch (error) {
					console.log(error);
					return Promise.reject('Unable to verify Degree ID.');
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

			const course = await Course.create(data);

			return res.status(201).json(
				await Course.findByPk(course.id, {
					include: Major,
				})
			);
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
		body('tuition').notEmpty().bail().isString().bail().optional(),
		body('description').notEmpty().bail().isString().optional(),
		body('DegreeId')
			.notEmpty()
			.bail()
			.isNumeric()
			.bail()
			.custom(async (id) => {
				try {
					const degree = await Degree.findByPk(id);
					if (!degree) {
						return Promise.reject('Invalid Degree ID.');
					}
					return id;
				} catch (error) {
					console.log(error);
					return Promise.reject('Unable to verify Degree ID.');
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

			const course = await Course.findByPk(id, {
				include: Major,
			});

			if (!course) {
				return res.sendStatus(404);
			}

			course.update(data);

			return res.json(course);
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
			const course = await Course.findByPk(id);
			if (course) {
				course.destroy();
			}
			return res.sendStatus(204);
		} catch (error) {
			console.log(error);
			return res.status(500).json(error);
		}
	}
);

module.exports = router;
