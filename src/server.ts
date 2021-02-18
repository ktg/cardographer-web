import * as sapper from '@sapper/server';
import * as http from "http";
import express from "express";
import cors from 'cors';
import {MongoClient} from "mongodb";

const {PORT} = process.env;

const app = express();

app.use(express.static('static'));
app.use(cors());
app.use(express.json());
app.use(sapper.middleware());

let delay = 1000;
const attemptConnection = function () {
	MongoClient.connect('mongodb://mongo:27017', {useUnifiedTopology: true})
		.then((client) => {
			console.log("Connected to DB");
			app.locals.db = client.db('cardographer');

			const server = http.createServer(app);
			server.listen(PORT);
			server.on('error', (error) => {
				throw error;
			});
		})
		.catch((err) => {
			console.log(err.message);
			setTimeout(attemptConnection, delay);
		});
};

attemptConnection();