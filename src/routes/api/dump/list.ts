import type {Request, Response} from "express";
import {getMongoCollection} from "../../../shared/db";

export async function get(req: Request, res: Response) {
	const result = await getMongoCollection(req, 'dump').find().toArray()
	res.json(result);
}