import type {Request, Response} from "express";
import {getMongoCollection} from "../../../shared/db";

export async function post(req: Request, res: Response) {
	let dumpDoc = req.body;
	await getMongoCollection(req, 'xSpace').insertMany(dumpDoc);
	res.json({"result": "success"});
}