import * as sapper from '@sapper/server'
import MongoStore from "connect-mongo"
import cors from 'cors'
import type {Request} from "express"
import express from "express"
import session from "express-session"
import * as http from "http"
import {MongoClient} from "mongodb"
import multer from "multer"
import nanoid from "nanoid";
import path from "path";

const {PORT} = process.env

const app = express()

// Wetlands Upload Handling
const namegen = nanoid.customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 15);
const uploadUri = '/uploads/wetlands/'
const uploadDir = '/app/uploads/wetlands/';
const upload = multer({
	storage: multer.diskStorage({
		destination: uploadDir,
		filename: function (req, file, cb) {
			cb(null, namegen() + path.extname(file.originalname))
		}
	})
});

app.use('/api/', cors())
app.use('/images/', cors({
	exposedHeaders: ['ETag']
}))
app.use(express.static('static'))
app.use(uploadUri, express.static(uploadDir))
app.use(express.json())
app.use('/api/wetlands/sightings', upload.single('image'))
app.use(session({
	secret: 'cardiosquirrel',
	resave: false,
	saveUninitialized: false,
	store: MongoStore.create({
		mongoUrl: 'mongodb://mongo:27017/sessions',
		ttl: 14 * 24 * 60 * 60 // = 14 days. Default
	})
}));
app.use(sapper.middleware({
	// customize the session
	session: (req: Request, _) => ({
		volunteer: req.session.volunteer,
		name: req.session.name
	})
}));

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