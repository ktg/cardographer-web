export async function get(req, res, next) {
	const { id } = req.params;

	let result = await req.app.locals.dump.findOne({'_id': ObjectId(id)});
	if(result !== null) {
		res.json(result);
	} else {
		next();
	}
}