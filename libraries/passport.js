const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;

const { Token, User } = require('../models');

passport.use(
	new BearerStrategy(async (token, done) => {
		try {
			const exists = await Token.findOne({
				where: {
					hash: token,
				},
				include: User,
			});

			if (!exists) {
				return done(null, false);
			}

			return done(null, exists.User);
		} catch (error) {
			return done(error);
		}
	})
);

module.exports = passport;
