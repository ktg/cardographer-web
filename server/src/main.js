const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const createError = require('http-errors');
const logger = require('morgan');
const debug = require('debug')('server:server');
const http = require('http');

let db;

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.post('/api/dump', (req, res) => {
	let dumpDoc = req.body;
	db.collection('dump').insertOne(dumpDoc)
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

app.use(function (req, res, next) {
	next(createError(404));
});

let delay = 1000;
const attemptConnection = function() {
	MongoClient.connect('mongodb://mongo:27017/cardographer')
		.then((newDB) => {
			console.log("Connected to DB");
			db = newDB;

			const port = 80;
			const server = http.createServer(app);
			server.listen(port);
			server.on('error', (error) => {
				if (error.syscall !== 'listen') {
					throw error;
				}

				const bind = typeof port === 'string'
					? 'Pipe ' + port
					: 'Port ' + port;

				// handle specific listen errors with friendly messages
				switch (error.code) {
					case 'EACCES':
						console.error(bind + ' requires elevated privileges');
						process.exit(1);
						break;
					case 'EADDRINUSE':
						console.error(bind + ' is already in use');
						process.exit(1);
						break;
					default:
						throw error;
				}
			});
			server.on('listening', () => {
				const addr = server.address();
				const bind = typeof addr === 'string'
					? 'pipe ' + addr
					: 'port ' + addr.port;
				debug('Listening on ' + bind);
			});
		})
		.catch((err) => {
			console.log(err);
			setTimeout(attemptConnection, delay);
		});
};

attemptConnection();
