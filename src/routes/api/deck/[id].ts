import {ObjectId} from 'mongodb';
import type {Request, Response, NextFunction} from "express";
import {getMongoCollection} from "../../../shared/db";

export async function get(req: Request, res: Response, next: NextFunction) {
	const {id} = req.params;

	let result = await getMongoCollection(req, 'deck').findOne({'_id': new ObjectId(id)});
	if (result !== null) {
		res.json(result);
	} else {
		next();
	}
}