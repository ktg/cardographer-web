export async function get(req, res, _) {
	const result = await req.app.locals.db.collection('deck').find().toArray();
	if(req.query.full !== 'true') {
		result.forEach((item) => {
			// TODO Simplify json
			//delete item.cards;
		});
	}
	res.json(result);
}