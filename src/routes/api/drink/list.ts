import {getDb} from "$lib/db";
import type {EndpointOutput} from "@sveltejs/kit";

export async function get(): Promise<EndpointOutput> {
	const db = await getDb()
	const result = await db.collection('drink').find().toArray();
	result.forEach((item) => {
		delete item._id;
	})
	return {body: result}
}