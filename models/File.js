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
			const scope = this.public === 1 ? 'public' : 'private';
			return `${process.env.HOST}:${process.env.PORT}/api/file/${scope}/${this.id}`;
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
		fs.unlinkSync(file.url);
	});
};

module.exports = Model;
