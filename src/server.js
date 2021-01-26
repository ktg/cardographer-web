import * as sapper from '@sapper/server';

const {PORT} = process.env;

//const createError = require('http-errors');
const express = require('express');
const http = require('http');
const logger = require('morgan');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/templates');

app.use(express.static('static'));
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(sapper.middleware());

let delay = 1000;
const attemptConnection = function () {
	MongoClient.connect('mongodb://mongo:27017', {useUnifiedTopology: true})
		.then((client) => {
			console.log("Connected to DB");
			const db = client.db('cardographer');

			app.locals.db = db;
			app.locals.dump = db.collection('dump');
			app.locals.xSpace = db.collection('xSpace');

			const server = http.createServer(app);
			server.listen(PORT);
			server.on('error', (error) => {
				if (error.syscall !== 'listen') {
					throw error;
				}
				switch (error.code) {
					case 'EACCES':
						console.error('Port ' + PORT + ' requires elevated privileges');
						process.exit(1);
						break;
					case 'EADDRINUSE':
						console.error('Port ' + PORT + ' is already in use');
						process.exit(1);
						break;
					default:
						console.error(error);
						throw error;
				}
			});
		})
		.catch((err) => {
			console.log(err.message);
			setTimeout(attemptConnection, delay);
		});
};

attemptConnection();