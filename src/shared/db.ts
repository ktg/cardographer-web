import type {Request} from "express";
import type {Db, Collection} from "mongodb";

function getMongoDB(req: Request): Db {
	return req.app.locals.db;
}

export function getMongoCollection(req: Request, collection: string): Collection {
	return getMongoDB(req).collection(collection);
}

