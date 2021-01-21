export async function post(req, res, _) {
	let dumpDoc = req.body;
	const result = await req.app.locals.dump.insertOne(dumpDoc);
	res.json({"result": "success", "insertedId": result.insertedId});
}