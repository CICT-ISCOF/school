const multer = require('multer');
const mimeTypes = require('mime-types');
const path = require('path');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '../storage'));
	},
	filename: (req, { fieldname, mimetype, filename }, cb) => {
		const extension = mimeTypes.extension(mimetype);
		if (!extension) {
			return cb(new Error('Invalid extension.'), filename);
		}
		cb(null, `${fieldname}-${Date.now()}.${extension}`);
	},
});

const upload = multer({ storage });

module.exports = {
	upload,
	storage,
	multer,
	mimeTypes,
};
