const router = require('express').Router();
const hash = require('bcrypt');
const { User, Token } = require('../models');
const { randomString } = require('../libraries/helpers');
const { body, matchedData, validationResult } = require('express-validator');

router.post(
	'/login',
	[
		body('username').notEmpty().bail().isString(),
		body('password').notEmpty().bail().isString(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		const { username, password } = matchedData(req, {
			locations: ['body'],
		});
		try {
			const user = await User.findOne({
				where: {
					username,
				},
			});
			if (!user) {
				return res.status(404).json({
					errors: ['User does not exist.'],
				});
			}
			if (!hash.compareSync(password, user.password)) {
				return res.status(401).json({
					errors: ['Password is incorrect.'],
				});
			}
			const token = await Token.create({
				hash: randomString(60),
				UserId: user.id,
			});
			return res.json({
				user,
				token: token.hash,
			});
		} catch (error) {
			return res.status(500).json(error.toJSON());
		}
	}
);

router.post(
	'/register',
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

module.exports = router;
