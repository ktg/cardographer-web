import {getDb} from "$lib/db";
import type {Request, EndpointOutput} from "@sveltejs/kit";

export async function get(req: Request): Promise<EndpointOutput> {
	const db = await getDb()
	let collectionName = 'drink'
	const channel = req.query['channel'] as string
	if(channel) {
		collectionName = 'drink-' + channel
	}
	const result = await db.collection(collectionName).find().toArray();
	result.forEach((item) => {
		delete item._id;
	})
	return {body: result}
}