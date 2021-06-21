import {getDb} from "$lib/db";
import type {EndpointOutput, Request} from "@sveltejs/kit"

export async function post(req: Request): Promise<EndpointOutput> {
	let dumpDoc = JSON.parse(req.rawBody as string)
	const db = await getDb()
	const result = await db.collection('dump').insertOne(dumpDoc)
	return {body: {"result": "success", "insertedId": result.insertedId}}
}