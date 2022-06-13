import {getDb} from "$lib/db";
import type {RequestHandler} from "@sveltejs/kit";

export const get: RequestHandler = async function ({url}) {
	const db = await getDb()
	let collectionName = 'drink'
	const channel = url.searchParams.get('channel')
	if (channel) {
		collectionName = 'drink-' + channel
	}
	const result = await db.collection(collectionName).find().toArray();
	result.forEach((item) => {
		delete item._id;
	})
	return {body: result}
}