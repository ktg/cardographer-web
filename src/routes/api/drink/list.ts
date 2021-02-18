import type {Request, Response, NextFunction} from "express";
import {getMongoCollection} from "../../../shared/db";

export async function get(req: Request, res: Response, next: NextFunction) {
	const result = await getMongoCollection(req, 'drink').find().toArray();
	result.forEach((item) => {
		delete item._id;
	});
	res.json(result);
}