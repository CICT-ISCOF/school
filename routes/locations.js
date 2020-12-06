const router = require('express').Router();
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
		const schools = await School.findAll();
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
				ip_address: req.ip,
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
