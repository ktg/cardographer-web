import {getDb} from "$lib/db";
import type {EndpointOutput} from "@sveltejs/kit";

export async function get(): Promise<EndpointOutput> {
	const db = await getDb()
	return {body: await db.collection('xSpace').find().toArray()}
}