const router = require('express').Router();
const hash = require('bcrypt');
const passport = require('../libraries/passport');
const {
	User,
	School,
	File,
	Degree,
	Education,
	Token,
	Course,
} = require('../models');
const { body, validationResult, matchedData } = require('express-validator');

const onlyAdmin = (req, res, next) => {
	if (!req.user.type === 'Admin') {
		return res.sendStatus(403);
	}
	return next();
};

router.get('/', async (req, res) => {
	try {
		return res.json(
			await User.findAll({
				include: [
					{
						model: School,
						include: [File, Degree, Education],
					},
				],
			})
		);
	} catch (error) {
		console.log(error);
		return res.status(500).json(error);
	}
});

router.get(
	'/:id',
	passport.authenticate('bearer', { session: false }),
	async (req, res) => {
		const id = req.params.id;
		try {
			return res.json(
				await User.findByPk(id, {
					include: [
						{
							model: School,
							include: [
								File,
								{
									model: Degree,
									include: Course,
								},
								Education,
							],
						},
					],
				})
			);
		} catch (error) {
			console.log(error);
			return res.status(500).json(error);
		}
	}
);

router.post(
	'/',
	[
		body('username').notEmpty().bail().isString(),
		body('password').notEmpty().bail().isString(),
		body('type').custom(async (type, { req }) => {
			const validTypes = ['Admin', 'School Admin'];
			if (!validTypes.includes(type)) {
				return Promise.reject('Invalid type.');
			}
			if (type === 'Admin') {
				if (!('authorization' in req.headers)) {
					return Promise.reject('Invalid headers.');
				}
				const fragments = req.headers.authorization.split(' ');
				if (!fragments.length === 2) {
					return Promise.reject('Invalid token.');
				}
				try {
					const token = await Token.findOne({
						where: {
							hash: fragments[1],
						},
						include: User,
					});
					if (!token) {
						return Promise.reject('Invalid token.');
					}
					if (token.User.type !== 'Admin') {
						return Promise.reject('Invalid user.');
					}
					return type;
				} catch (error) {
					console.log(error);
					return Promise.reject('Unable to verify.');
				}
			}
		}),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		const { username, password, type } = matchedData(req, {
			locations: ['body'],
		});
		const user = await User.create({
			username,
			type,
			password: hash.hashSync(password, 10),
		});
		return res.status(201).json(user);
	}
);

router.put(
	'/:id',
	passport.authenticate('bearer', { session: false }),
	onlyAdmin,
	[
		body('username').notEmpty().bail().isString().optional(),
		body('password').notEmpty().bail().isString().optional(),
	],
	async (req, res) => {
		const errors = validationResult(req).array();

		if (errors.length > 0) {
			return res.status(422).json({ errors });
		}

		const id = req.params.id;
		const data = matchedData(req, { locations: ['body'] });
		try {
			const user = await User.findByPk(id);
			if (!user) {
				return res.sendStatus(404);
			}
			if ('password' in data) {
				data.password = hash.hashSync(data.password);
			}
			user.update(data);
			return res.json(user);
		} catch (error) {
			console.log(error);
			return res.status(500).json(error);
		}
	}
);

router.delete(
	'/:id',
	passport.authenticate('bearer', { session: false }),
	onlyAdmin,
	async (req, res) => {
		const id = req.params.id;
		try {
			const user = await User.findByPk(id);
			if (user) {
				user.destroy();
			}
			return res.sendStatus(204);
		} catch (error) {
			console.log(error);
			return res.status(500).json(error);
		}
	}
);

module.exports = router;
