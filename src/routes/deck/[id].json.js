export function get(req, res, next) {
	const { slug } = req.params;
	req.app.locals.db.collection('cardographer').findOne({});

	if (lookup.has(slug)) {
		res.contentType('application/json');
		res.json(lookup.get(slug));
	} else {
		res.writeHead(404, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			message: `Not found`
		}));
	}
}