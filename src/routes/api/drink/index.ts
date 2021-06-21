import {getDb} from "$lib/db";
import type {EndpointOutput, Request} from "@sveltejs/kit";

export async function post(req: Request): Promise<EndpointOutput> {
	const dataSet = JSON.parse(req.rawBody as string)
	if (Array.isArray(dataSet.data) && typeof dataSet.device === 'string') {
		const device = dataSet.device.slice(-5);
		dataSet.data.forEach((item) => {
			item.device = device;
		});
		const db = await getDb()
		const collection = await db.collection('drink')
		await collection.insertMany(dataSet.data)
		delete dataSet.data;
		const result = await collection.insertOne(dataSet)
		return {body: {"result": "success", "insertedId": result.insertedId}}
	} else {
		return {status: 400, body: "Missing Parameters"}
	}
}