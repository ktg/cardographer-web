import {getDb} from "$lib/db";
import type {EndpointOutput, Request} from "@sveltejs/kit";
import mongodb from "mongodb";
// commonjs workaround? (build for node complains)
let {ObjectID} = mongodb;

export async function get(req: Request): Promise<EndpointOutput> {
	const {id} = req.params;

	const db = await getDb()
	const result = await db.collection('dump').findOne({'_id': new ObjectID(id)});
	if (result !== null) {
		return {body: result}
	} else {
		return null
	}
}