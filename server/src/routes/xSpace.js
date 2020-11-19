const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
	let dumpDoc = req.body;
	req.app.locals.xSpace.insertMany(dumpDoc)
		.then((result) => {
			res.json({"result": "success", "insertedId": result.insertedId});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

router.get('/list', (req, res) => {
	req.app.locals.xSpace.find().toArray()
		.then((result) => {
			res.json(result);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

module.exports = router

