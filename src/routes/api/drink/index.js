export async function post(req, res, _) {
	let dataSet = req.body;
	dataSet.data.forEach((item) => {
		item.device = dataSet.device;
	});
	const collection = req.app.locals.db.collection('drink')
	await collection.insertMany(dataSet.data);
	delete dataSet.data;
	const result = await collection.insert(dataSet);
	res.json({"result": "success", "insertedId": result.insertedId});
}