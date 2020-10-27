const router = require('express').Router();
const { Degree, School, Course, Major } = require('../models');
const { upload } = require('../libraries/multer');
const fs = require('fs');
const passport = require('../libraries/passport');

const { body, matchedData, validationResult } = require('express-validator');

router.get('/', async (req, res) => {
	try {
		res.json(
			await Degree.findAll({
				include: [
					School,
					{
						model: Course,
						include: [Major],
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
			await Degree.findByPk(id, {
				include: [
					School,
					{
						model: Course,
						include: [Major],
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
		body('name').notEmpty().bail().isString(),
		body('type')
			.notEmpty()
			.bail()
			.custom((type) => {
				const validTypes = ['Bachelor', 'Master', 'PhD'];
				if (!validTypes.includes(type)) {
					return Promise.reject('Invalid type.');
				}
				return type;
			}),
		body('description').notEmpty().bail().isString(),
		body('SchoolId')
			.notEmpty()
			.bail()
			.isNumeric()
			.bail()
			.custom(async (id) => {
				try {
					const school = await School.findByPk(id);
					if (!school) {
						return Promise.reject('Invalid School ID.');
					}
					return id;
				} catch (error) {
					console.log(error);
					return Promise.reject('Unable to verify School ID.');
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

			const degree = await Degree.create(data);
			return res.status(201).json(
				await Degree.findByPk(degree.id, {
					include: [
						School,
						{
							model: Course,
							include: [Major],
						},
					],
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
	upload.single('photo'),
	[
		body('name').notEmpty().bail().isString().optional(),
		body('type')
			.notEmpty()
			.bail()
			.custom((type) => {
				const validTypes = ['Bachelor', 'Master', 'PhD'];
				if (!validTypes.includes(type)) {
					return Promise.reject('Invalid type.');
				}
				return type;
			})
			.optional(),
		body('description').notEmpty().bail().isString().optional(),
		body('SchoolId')
			.notEmpty()
			.bail()
			.isNumeric()
			.bail()
			.custom(async (id) => {
				try {
					const school = await School.findByPk(id);
					if (!school) {
						return Promise.reject('Invalid School ID.');
					}
					return id;
				} catch (error) {
					console.log(error);
					return Promise.reject('Unable to verify School ID.');
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

			const degree = await Degree.findByPk(id, {
				include: [
					School,
					{
						model: Course,
						include: [Major],
					},
				],
			});

			if (!degree) {
				return res.sendStatus(404);
			}

			degree.update(data);

			return res.json(degree);
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
			const degree = await Degree.findByPk(id);
			if (degree) {
				degree.destroy();
			}
			return res.sendStatus(204);
		} catch (error) {
			console.log(error);
			return res.status(500).json(error);
		}
	}
);

module.exports = router;
