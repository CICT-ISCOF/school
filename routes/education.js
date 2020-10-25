const router = require('express').Router();
const { Education, School, File } = require('../models');
const { upload } = require('../libraries/multer');
const fs = require('fs');
const passport = require('../libraries/passport');

const { body, matchedData, validationResult } = require('express-validator');

router.get('/', async (req, res) => {
	try {
		res.json(
			await Education.findAll({
				include: [
					{
						model: School,
						include: File,
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
			await Education.findByPk(id, {
				include: [
					{
						model: School,
						include: File,
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
		body('type')
			.notEmpty()
			.bail()
			.isString()
			.bail()
			.custom((value) => {
				const validTypes = [
					'Preschool',
					'Elementary',
					'Secondary',
					'SHS',
				];
				return validTypes.includes(value)
					? value
					: Promise.reject('Invalid type.');
			}),
		body('tuition').notEmpty().bail().isString().bail(),
		body('date_of_examination')
			.notEmpty()
			.bail()
			.isISO8601()
			.bail()
			.optional({
				nullable: true,
			})
			.toDate(),
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

			const education = await Education.create(data);

			return res.status(201).json(education);
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
		body('type')
			.notEmpty()
			.bail()
			.isString()
			.bail()
			.custom((value) => {
				const validTypes = [
					'Preschool',
					'Elementary',
					'Secondary',
					'SHS',
				];
				return validTypes.includes(value)
					? value
					: Promise.reject('Invalid type.');
			})
			.optional(),
		body('description').notEmpty().bail().isString().optional(),
		body('tuition').notEmpty().bail().isString().bail().optional(),
		body('date_of_examination')
			.notEmpty()
			.bail()
			.isISO8601()
			.bail()
			.optional({
				nullable: true,
			})
			.toDate(),
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

			const education = await Education.findByPk(id);

			if (!education) {
				return res.sendStatus(404);
			}

			education.update(data);

			return res.json(education);
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
			const education = await Education.findByPk(id);
			if (education) {
				education.destroy();
			}
			return res.sendStatus(204);
		} catch (error) {
			console.log(error);
			return res.status(500).json(error);
		}
	}
);

module.exports = router;
