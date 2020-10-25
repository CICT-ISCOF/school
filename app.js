const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();
const cors = require('cors');

const sequelize = require('./libraries/sequelize');
const models = require('./models');

app.set('sequelize', sequelize);

// paths setup
app.set('storage_path', path.join(__dirname, 'storage'));

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/education', require('./routes/education'));
app.use('/api/file', require('./routes/file'));
app.use('/api/schools', require('./routes/schools'));
app.use('/api/users', require('./routes/users'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next({
		message: '',
		status: 404,
	});
});

// error handler
app.use(function (error, req, res, next) {
	res.locals.message = error.message;
	res.locals.error = process.env.ENV !== 'production' ? error : {};

	console.log(error);
	res.status(error.status || 500);
	res.json(res.locals.error);
});

module.exports = app;
