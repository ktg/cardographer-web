import {getDb} from "$lib/db";
import type {EndpointOutput, Request} from "@sveltejs/kit";

export async function post(req: Request): Promise<EndpointOutput> {
	let dumpDoc = req.body as any
	const db = await getDb()
	await db.collection('xSpace').insertMany(dumpDoc)
	return {body: {"result": "success"}}
}