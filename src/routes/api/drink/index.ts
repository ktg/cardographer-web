import {getDb} from "$lib/db";
import type {RequestHandler} from "@sveltejs/kit";

export const post: RequestHandler = async function ({url, request}) {
	const dataSet = await request.json()
	if (Array.isArray(dataSet.data) && typeof dataSet.device === 'string') {
		const device = dataSet.device.slice(-5);
		dataSet.data.forEach((item) => {
			item.device = device;
		});
		const db = await getDb()
		let collectionName = 'drink'
		const channel = url.searchParams.get('channel')
		if (channel) {
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