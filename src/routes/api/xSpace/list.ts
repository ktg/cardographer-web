import type {Request, Response} from "express";
import {getMongoCollection} from "../../../shared/db";

export async function get(req: Request, res: Response) {
	const result = await getMongoCollection(req, 'xSpace').find().toArray()
	res.json(result);
}