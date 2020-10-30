const { DataTypes } = require('sequelize');
const sequelize = require('../libraries/sequelize');
const fs = require('fs');

const Model = sequelize.define('File', {
	type: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	url: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	public: {
		type: DataTypes.TINYINT({ length: 1 }),
		allowNull: false,
	},
	size: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	uri: {
		type: DataTypes.VIRTUAL,
		get() {
			const url =
				process.env.ENV === 'local'
					? `${process.env.HOST}:${process.env.PORT}`
					: process.env.HOST;
			const scope = this.public === 1 ? 'public' : 'private';
			return `${url}/api/file/${scope}/${this.id}`;
		},
	},
});

Model.associate = (models) => {};

Model.process = (file, public) => {
	return Model.create({
		type: file.mimetype,
		name: file.filename,
		url: file.path,
		public,
		size: file.size,
	});
};

Model.registerEvents = (models) => {
	Model.beforeDestroy((file) => {
		try {
			fs.unlinkSync(file.url);
		} catch (error) {}
	});
};

module.exports = Model;
