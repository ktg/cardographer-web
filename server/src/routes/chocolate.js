const express = require('express');
const nanoid = require('nanoid');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {getMetadata} = require('page-metadata-parser');
const domino = require('domino');
const fetch = require('node-fetch');
const AbortController = require('abort-controller');

const uploadDir = process.cwd() + '/uploads/chocolate/';
const uploadUri = '/chocolate/uploads/'

const namegen = nanoid.customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 12);
const upload = multer({
	storage: multer.diskStorage({
		destination: uploadDir,
		filename: function (req, file, cb) {
			cb(null, namegen() + path.extname(file.originalname))
		}
	})
});
const idgen = nanoid.customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);

router.use('/uploads', express.static(uploadDir));
router.use('/', express.static(__dirname + '/chocolate/'));

router.get('/', (req, res) => {
	res.render( 'intro.ejs');
});

router.get('/create', (req, res) => {
	const id = idgen();
	const item = {
		"order": id,
		"content": []
	}
	req.app.locals.chocDb.collection('order').insertOne(item)
		.then(() => {
			res.redirect(id + '/create');
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

router.get('/api/list', (req, res) => {
	req.app.locals.chocDb.collection('order').find().toArray()
		.then((result) => {
			res.json(result);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

router.get('/:orderid', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('order').findOne({"order": orderid})
	if (order) {
		res.render('view.ejs', order)
	} else {
		res.status(404).send("Not Found");
	}
});

router.get('/:orderid/create', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('order').findOne({"order": orderid});
	console.log(order);
	if (order) {
		res.render('edit.ejs', order);
	} else {
		res.status(404).send();
	}
});

router.post('/:orderid/deleteItem', (req, res) => {
	const orderid = req.params['orderid'];
	req.app.locals.chocDb.collection('order').findOne({"order": orderid})
		.then((order) => {
			if (order) {
				const removeIndex = req.body.item;
				let uri = order.content[removeIndex].uri;
				console.log(uri);
				if ((typeof uri === 'string' || uri instanceof String) && uri.startsWith(uploadUri)) {
					uri = uri.replace(uploadUri, uploadDir)
					if (fs.existsSync(uri)) {
						fs.unlinkSync(uri);
					}
				}
				// noinspection EqualityComparisonWithCoercionJS
				order.content = order.content.filter((value, index) => index != removeIndex);
				req.app.locals.chocDb.collection('order').replaceOne({"order": orderid}, order)
					.then(() => {
						res.redirect('create');
					})
			} else {
				res.status(404).send();
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

router.post('/:orderid/addMessage', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('order').findOne({"order": orderid})
	if (order) {
		order.content.push({
			uri: "",
			mimetype: "text/plain"
		});
		await req.app.locals.chocDb.collection('order').replaceOne({"order": orderid}, order);
		res.redirect('create');
	} else {
		res.status(404).send("Not Found");
	}
});

router.post('/:orderid/updateMessage', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('order').findOne({"order": orderid});
	if (order) {
		const itemIndex = req.body.item;
		order.content[itemIndex].uri = req.body.content;
		console.log(order);
		await req.app.locals.chocDb.collection('order').replaceOne({"order": orderid}, order)
		res.redirect('create');
	} else {
		res.status(404).send();
	}
});

router.post('/:orderid/addFile', upload.single('file'), async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('order').findOne({"order": orderid})
	if (order) {
		let uri = req.file.path;
		uri = uri.replace(uploadDir, uploadUri);
		order.content.push({
			"uri": uri,
			"mimetype": req.file.mimetype
		});
		await req.app.locals.chocDb.collection('order').replaceOne({"order": orderid}, order)
		res.redirect('create');
	} else {
		res.status(404).send();
	}
});

async function fetchTimeout(url, time) {
	const controller = new AbortController();
	const timeout = setTimeout(() => {
		controller.abort();
	}, time);

	try {
		return await fetch(url, {signal: controller.signal});
	} catch (error) {
		if (error.name === 'AbortError') {
			console.log('request was aborted');
		}
	} finally {
		clearTimeout(timeout);
	}
}

const youtubeMatcher = new RegExp('^(?:.+?)?(?:\\/v\\/|watch\\/|\\?v=|&v=|youtu\\.be\\/|\\/v=|^youtu\\.be\\/|watch%3Fv%3D)([a-zA-Z0-9_-]{11})+$', 'i');
router.post('/:orderid/addLink', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('order').findOne({"order": orderid})
	let uri = req.body.link.trim();
	const match = uri.match(youtubeMatcher);
	if (match) {
		order.content.push({
			"uri": match[1],
			"mimetype": 'video/youtube'
		});
		await req.app.locals.chocDb.collection('order').replaceOne({"order": orderid}, order)
		res.redirect('create');
	} else {
		try {
			const response = await fetchTimeout(uri, 3000);
			const contentType = response.headers.get("content-type");
			if (contentType && (contentType.startsWith("video/") || contentType.startsWith("audio/") || contentType.startsWith("image/"))) {
				order.content.push({
					"uri": uri,
					"mimetype": contentType,
				});
			} else {
				const html = await response.text();
				const doc = domino.createWindow(html).document;
				const metadata = getMetadata(doc, uri);
				console.log(metadata);
				order.content.push({
					"uri": uri,
					"mimetype": 'text/x-uri',
					"title": metadata.title,
					"description": metadata.description,
					"icon": metadata.icon,
					"image": metadata.image,
					"provider": metadata.provider
				});
			}
			await req.app.locals.chocDb.collection('order').replaceOne({"order": orderid}, order)
			res.redirect('create');
		} catch (e) {
			order.content.push({
				"uri": uri,
				"mimetype": 'text/x-uri'
			});
			await req.app.locals.chocDb.collection('order').replaceOne({"order": orderid}, order)
			res.redirect('create');
		}
	}
});


module.exports = router

