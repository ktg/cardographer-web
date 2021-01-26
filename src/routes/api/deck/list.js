export async function get(req, res, _) {
	const result = await req.app.locals.db.collection('deck').find().toArray()
	res.json(result);
}