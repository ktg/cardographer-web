import type {Request, Response} from "express";
import {getMongoCollection} from "../../../shared/db";

export async function post(req: Request, res: Response) {
	let dumpDoc = req.body;
	const result = await getMongoCollection(req, 'dump').insertOne(dumpDoc);
	res.json({"result": "success", "insertedId": result.insertedId});
}