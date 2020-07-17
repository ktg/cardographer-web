const createError = require('http-errors');
const debug = require('debug')('server:server');
const express = require('express');
const http = require('http');
const logger = require('morgan');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

let db;

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.post('/api/dump', (req, res) => {
	let dumpDoc = req.body;
	db.collection('dump').insertOne(dumpDoc)
		.then((result) => {
			res.json({"result": "success", "insertedId": result.insertedId});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

app.post('/api/xSpace', (req, res) => {
	let dumpDoc = req.body;
	db.collection('xSpace').insertOne(dumpDoc)
		.then((result) => {
			res.json({"result": "success", "insertedId": result.insertedId});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

app.get('/api/dump/list', (req, res) => {
	db.collection('dump').find().toArray()
		.then((result) => {
			res.json(result);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

app.get('/api/xSpace/list', (req, res) => {
	db.collection('xSpace').find().toArray()
		.then((result) => {
			res.json(result);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

app.get('/api/dump/:id', (req, res) => {
	let id = req.params.id;
	db.collection('dump').findOne({'_id': ObjectId(id)})
		.then((result) => {
			res.json(result);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

app.use(function (req, res, next) {
	next(createError(404));
});

let delay = 1000;
const attemptConnection = function () {
	MongoClient.connect('mongodb://mongo:27017')
		.then((client) => {
			console.log("Connected to DB");
			db = client.db('cardographer');

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
