import {getDb} from "$lib/db";
import type {RequestHandler} from "@sveltejs/kit";

export const post: RequestHandler = async function ({request}) {
	let dumpDoc = await request.json() as any
	const db = await getDb()
	const result = await db.collection('dump').insertOne(dumpDoc)
	return {body: {"result": "success", "insertedId": result.insertedId.toHexString()}}
}