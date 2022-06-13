import {getDb} from "$lib/db";
import type {RequestHandler} from "@sveltejs/kit";

export const get: RequestHandler = async function ({}) {
	const db = await getDb()
	return {body: await db.collection('xSpace').find().toArray()}
}