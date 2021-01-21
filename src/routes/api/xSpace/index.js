export async function post(req, res, _) {
	let dumpDoc = req.body;
	const result = await req.app.locals.xSpace.insertMany(dumpDoc);
	res.json({"result": "success", "insertedId": result.insertedId});
}