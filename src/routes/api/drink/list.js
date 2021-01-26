export async function get(req, res, _) {
	const result = await req.app.locals.db.collection('drink').find().toArray()
	res.json(result);
}