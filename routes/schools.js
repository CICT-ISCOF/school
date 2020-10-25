const router = require('express').Router();
const {
	School,
	File,
	Education,
	Degree,
	User,
	Course,
	Major,
} = require('../models');
const { upload } = require('../libraries/multer');
const fs = require('fs');
const passport = require('../libraries/passport');

const { body, matchedData, validationResult } = require('express-validator');

router.get('/', async (req, res) => {
	try {
		res.json(
			await School.findAll({
				include: [
					File,
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
			await School.findByPk(id, {
				include: [
					File,
					Education,
					{
						model: Degree,
						include: Course,
					},
					User,
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
	upload.single('photo'),
	[
		body('region').notEmpty().bail().isString(),
		body('type').notEmpty().bail().isString(),
		body('district').notEmpty().bail().isString(),
		body('province').notEmpty().bail().isString(),
		body('name').notEmpty().bail().isString(),
		body('address').notEmpty().bail().isString(),
		body('phone').notEmpty().bail().isNumeric(),
		body('email').notEmpty().bail().isString().bail().isEmail(),
		body('website').notEmpty().bail().isURL(),
	],
	async (req, res) => {
		const errors = validationResult(req).array();
		if (!req.file) {
			errors.push({
				msg: 'Photo is required.',
				param: 'photo',
				location: 'body',
			});
		}
		if (errors.length > 0) {
			return res.status(422).json({ errors });
		}

		try {
			const data = matchedData(req, { locations: ['body'] });
			const file = await File.process(req.file, true);
			data.FileId = file.id;
			data.UserId = req.user.id;
			const school = await School.create(data);
			school.set('File', file);
			return res.status(201).json(school);
		} catch (error) {
			if (req.file) {
				fs.unlinkSync(req.file.path);
			}
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
		body('region').notEmpty().bail().isString().bail().optional(),
		body('type').notEmpty().bail().isString().bail().optional(),
		body('district').notEmpty().bail().isString().bail().optional(),
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
				include: [File, Education, Degree],
			});

			if (!school) {
				return res.sendStatus(404);
			}

			if (req.file) {
				const file = await File.process(req.file, true);
				data.FileId = file.id;
				school.File.destroy();
				school.set('File', file);
			}

			school.update(data);

			return res.json(school);
		} catch (error) {
			if (req.file) {
				fs.unlinkSync(req.file.path);
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
