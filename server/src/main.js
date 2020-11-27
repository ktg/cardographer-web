const createError = require('http-errors');
const debug = require('debug')('server:server');
const express = require('express');
const http = require('http');
const logger = require('morgan');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/templates');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/dump', require('./routes/cardographer'));
app.use('/api/xSpace', require('./routes/xSpace'));
app.use('/api/runningman', require('./routes/runningman'));
app.use('/chocolate', require('./routes/chocolate'));

//app.use(express.static('static'));

app.use((req, res) => {
	res.status(404).send("Not Found");
});

let delay = 1000;
const attemptConnection = function () {
	MongoClient.connect('mongodb://mongo:27017', {useUnifiedTopology: true})
		.then((client) => {
			console.log("Connected to DB");
			const db = client.db('cardographer');

			app.locals.cardographer = db.collection('dump');
			app.locals.xSpace = db.collection('xSpace');

			app.locals.chocDb = client.db('chocolate');

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
						console.error(error);
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
			console.log(err.message);
			setTimeout(attemptConnection, delay);
		});
};

attemptConnection();
