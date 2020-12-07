const router = require('express').Router();
const { Op } = require('sequelize/types');
const { School, Rating } = require('../models');

router.get('/regions', async (req, res) => {
	try {
		const schools = await School.findAll();
		const data = [];
		schools.forEach((school) => {
			if (!data.includes(school.region)) {
				data.push(school.region);
			}
		});
		return res.json(data);
	} catch (error) {
		console.log(error);
		return res.status(500).json(error);
	}
});

router.get('/provinces', async (req, res) => {
	try {
		const params = {};
		if ('region' in req.query) {
			const region = req.query.region;
			params.where = {
				region: {
					[Op.substring]: region,
				},
			};
		}
		const schools = await School.findAll(params);
		const data = [];
		schools.forEach((school) => {
			if (!data.includes(school.province)) {
				data.push(school.province);
			}
		});
		return res.json(data);
	} catch (error) {
		console.log(error);
		return res.status(500).json(error);
	}
});

router.get('/rating-status', async (req, res) => {
	try {
		const rating = await Rating.findOne({
			where: {
				ip_address: req.query.ip_address,
				SchoolId: req.query.SchoolId,
			},
		});
		return res.json({
			has_rated: rating !== null,
			rating,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json(error);
	}
});

module.exports = router;
