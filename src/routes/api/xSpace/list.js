export async function get(req, res, _) {
	const result = await req.app.locals.xSpace.find().toArray()
	res.json(result);
}