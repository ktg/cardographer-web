export async function get(req, res, _) {
	const result = await req.app.locals.db.collection('drink').find().toArray();
	result.forEach((item) => {
		delete item._id;
	});
	res.json(result);
}