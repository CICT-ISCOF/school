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

			school.set('ProfilePicture', profilePicture);
			school.set('CoverPhoto', coverPhoto);

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
					Degree,
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
