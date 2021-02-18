import type {Request, Response} from "express";
import {getMongoCollection} from "../../../shared/db";

export async function get(req: Request, res: Response) {
	const result = await getMongoCollection(req, 'deck').find().toArray();
	if (req.query.full !== 'true') {
		result.forEach((item) => {
			// TODO Simplify json
			//delete item.cards;
		});
	}
	res.json(result);
}