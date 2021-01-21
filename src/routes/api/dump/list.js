export async function get(req, res, _) {
	const result = await req.app.locals.dump.find().toArray()
	res.json(result);
}