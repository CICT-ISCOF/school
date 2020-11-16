const router = require('express').Router();
const { File } = require('../models');
const fs = require('fs');
const passport = require('../libraries/passport');

router.get('/public/:id', async (req, res) => {
	const id = req.params.id;
	const file = await File.findByPk(id);
	if (!file || file.public !== 1) {
		return res.sendStatus(404);
	}

	const binary = fs.readFileSync(file.url);

	res.setHeader('Content-Type', file.type);
	res.setHeader('Content-Length', file.size);
	res.send(binary);
});

router.get(
	'/private/:id',
	passport.authenticate('bearer', { session: false }),
	async (req, res) => {
		const id = req.params.id;
		const file = await File.findByPk(id);
		if (!file) {
			return res.sendStatus(404);
		}

		const binary = fs.readFileSync(file.url);

		res.setHeader('Content-Type', file.type);
		res.setHeader('Content-Length', file.size);
		res.send(binary);
	}
);

module.exports = router;
