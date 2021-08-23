import type {Db} from 'mongodb'
import {MongoClient} from "mongodb"

const {MONGODB} = process.env

const url = MONGODB ? MONGODB : 'mongodb://mongo:27017'
const dbname = 'cardographer'
const RETRY_DELAY = 3000

let db: Promise<Db> = new Promise<Db>((resolve, reject) => {
	attemptConnection(resolve, reject)
})

function attemptConnection(resolve: (value: Db) => void, reject): void {
	MongoClient.connect(url)
		.then((client) => {
			console.log("Connected to DB")
			resolve(client.db(dbname))
		})
		.catch((err) => {
			console.log(`DB error ${err.name}: ${err.message} - retrying...`);
			setTimeout(() => attemptConnection(resolve, reject), RETRY_DELAY);
		})
}

export async function getDb(): Promise<Db> {
	return await db
}
