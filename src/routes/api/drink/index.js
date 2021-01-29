export async function post(req, res, _) {
	const dataSet = req.body;
	if(dataSet.data.isArray() && typeof dataSet.device === 'string') {
		const device = dataSet.device.slice(-5);
		dataSet.data.forEach((item) => {
			item.device = device;
		});
		const collection = req.app.locals.db.collection('drink')
		await collection.insertMany(dataSet.data);
		delete dataSet.data;
		const result = await collection.insert(dataSet);
		res.json({"result": "success", "insertedId": result.insertedId});
	} else {
		res.status(400).send("Missing Parameters");
	}
}