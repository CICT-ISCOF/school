if (!('toJSON' in Error.prototype)) {
	Object.defineProperty(Error.prototype, 'toJSON', {
		value() {
			const object = {};

			Object.getOwnPropertyNames(this).forEach((key) => {
				object[key] = this[key];
			}, this);

			return object;
		},
		configurable: true,
		writable: true,
	});
}

require('dotenv-expand')(require('dotenv').config());
const app = require('./app');
const http = require('http');
const port = process.env.PORT || 8000;

app.set('port', port);

const server = http.createServer(app);

server.listen(port);

server.on('error', (error) => {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
		default:
			throw error;
	}
});

server.on('listening', () => {
	const addr = server.address();
	const bind =
		typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	console.log('Listening on ' + bind);
});
