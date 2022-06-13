import {getDb} from "$lib/db";
import type {RequestHandler} from "@sveltejs/kit";

export const post: RequestHandler = async function ({request}) {
	let dumpDoc = await request.json()
	const db = await getDb()
	await db.collection('xSpace').insertMany(dumpDoc)
	return {body: {"result": "success"}}
}