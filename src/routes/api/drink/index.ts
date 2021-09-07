import {getDb} from "$lib/db";
import type {EndpointOutput, Request} from "@sveltejs/kit";

export async function post(req: Request): Promise<EndpointOutput> {
	const dataSet = req.body as any
	if (Array.isArray(dataSet.data) && typeof dataSet.device === 'string') {
		const device = dataSet.device.slice(-5);
		dataSet.data.forEach((item) => {
			item.device = device;
		});
		const db = await getDb()
		let collectionName = 'drink'
		const channel = req.query['channel'] as string
		if(channel) {
			collectionName = 'drink-' + channel
		}
		const collection = await db.collection(collectionName)
		await collection.insertMany(dataSet.data)
		delete dataSet.data;
		const result = await collection.insertOne(dataSet)
		return {body: {"result": "success", "insertedId": result.insertedId.toHexString()}}
	} else {
		return {status: 400, body: "Missing Parameters"}
	}
}