const router = require('express').Router();
const { File } = require('../models');
const fs = require('fs');
const passport = require('../libraries/passport');
const { Dropbox } = require('dropbox');
const { default: Axios } = require('axios');

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });

router.get('/public/:id', async (req, res) => {
	const id = req.params.id;
	const file = await File.findByPk(id);
	if (!file || file.public !== 1) {
		return res.sendStatus(404);
	}

	const result = await dbx.filesDownload({
		path: `/${file.name}`,
	});

	res.setHeader('Content-Type', file.type);
	res.setHeader('Content-Length', file.size);
	res.send(result.result.fileBinary);
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

		const result = await dbx.filesDownload({
			path: `/${file.name}`,
		});

		res.setHeader('Content-Type', file.type);
		res.setHeader('Content-Length', file.size);
		res.send(result.result.fileBinary);
	}
);

module.exports = router;
