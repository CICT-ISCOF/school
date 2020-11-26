const router = require('express').Router();
const { School, Rating } = require('../models');
const { body, matchedData, validationResult } = require('express-validator');

router.get('/', async (req, res) => {
	const id = req.query.id;
	const ratings = await Rating.findAll({
		where: {
			SchoolId: id,
		},
	});

	const totals = [0, 0, 0, 0, 0];

	ratings.forEach((rating) => {
		totals[rating.rating - 1] += 1;
	});

	console.log(totals);

	const all = totals.reduce((prev, next) => prev + next);

	const average = totals
		.map((rate, index) => (index + 1) * rate)
		.reduce((prev, next) => prev + next);

	const result = average / all;

	return res.json({
		total: result ? result : 0,
	});
});

router.post(
	'/',
	[
		body('rating')
			.notEmpty()
			.bail()
			.custom((value) => {
				return [1, 2, 3, 4, 5].includes(value)
					? value
					: Promise.reject('Invalid rating.');
			}),
		body('message').optional().bail().isString(),
		body('SchoolId')
			.notEmpty()
			.bail()
			.custom(async (id) => {
				try {
					const school = School.findByPk(id);
					if (!school) {
						return Promise.reject('School does not exist.');
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
			data.ip_address = req.ip;

			const rating = await Rating.create(data);
			return res.status(201).json(rating);
		} catch (error) {
			console.log(error);
			res.status(500).json(error);
		}
	}
);

module.exports = router;
