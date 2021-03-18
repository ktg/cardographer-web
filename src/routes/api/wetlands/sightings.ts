import type {Request, Response} from "express";
import {getMongoCollection} from "../../../shared/db";

const uploadUri = '/uploads/wetlands/'
const uploadDir = '/app/uploads/wetlands/';


export async function post(req: Request, res: Response) {
	let data = req.body
	if (req.session.volunteer) {
		data.volunteer = req.session.volunteer
	}
	data.timestamp = Date.now()
	if (req.file) {
		data.image = req.file.path.replace(uploadDir, uploadUri);
		data.mimeType = req.file.mimetype
	}

	console.log(data)

	await getMongoCollection(req, 'wetland-sightings').insertOne(data)
	res.redirect('/wetlands')
}

export async function get(req: Request, res: Response) {
	const result = await getMongoCollection(req, 'wetland-sightings').find().toArray();
	res.json(result);
}