import type {Request, Response, NextFunction} from "express";
import {getMongoCollection} from "../../../shared/db";

export async function post(req: Request, res: Response) {
	const dataSet = req.body;
	if (Array.isArray(dataSet.data) && typeof dataSet.device === 'string') {
		const device = dataSet.device.slice(-5);
		dataSet.data.forEach((item) => {
			item.device = device;
		});
		const collection = getMongoCollection(req, 'drink');
		await collection.insertMany(dataSet.data);
		delete dataSet.data;
		const result = await collection.insertOne(dataSet);
		res.json({"result": "success", "insertedId": result.insertedId});
	} else {
		res.status(400).send("Missing Parameters");
	}
}

export async function del(req: Request, res: Response, next: NextFunction) {
	if (req.query.key == 'aamo2r0p2ngWw4K4i5AN') {
		//const collection = getMongoCollection(req, 'drink');
		//await collection.deleteMany({})
		res.status(200).json({"result": "success"})
	} else {
		next()
	}
}