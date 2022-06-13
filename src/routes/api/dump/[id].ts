import {getDb} from "$lib/db";
import type {RequestHandler} from "@sveltejs/kit";
import {ObjectId} from "mongodb";

export const get: RequestHandler = async function ({params}) {
	const {id} = params;

	const db = await getDb()
	const result = await db.collection('dump').findOne({'_id': new ObjectId(id)});
	if (result !== null) {
		return {body: result}
	} else {
		return null
	}
}