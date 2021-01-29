// TODO Wrap in node_env development
export async function get(req, res, next) {
	if(req.query.key === 'eiOV3L9Djc3ujDimU7Rx') {
		const result = await req.app.locals.db.collection('drink').remove({})
		res.json(result);
	} else {
		next();
	}
}