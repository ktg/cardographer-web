const express = require('express');
const nanoid = require('nanoid');
const router = express.Router();
const multer = require('multer');
const cookieParser = require("cookie-parser");
const path = require('path');
const QRCode = require('qrcode');
const crypto = require('crypto');
const fs = require('fs');
const {getMetadata} = require('page-metadata-parser');
const domino = require('domino');
const fetch = require('node-fetch');
const AbortController = require('abort-controller');


const global_salt = "-hybrid-choco-gifting-";

const uploadDir = process.cwd() + '/uploads/chocolate/';
const uploadUri = '../../uploads/'

const namegen = nanoid.customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 15);
const upload = multer({
	storage: multer.diskStorage({
		destination: uploadDir,
		filename: function (req, file, cb) {
			cb(null, namegen() + path.extname(file.originalname))
		}
	})
});

router.use('/uploads', express.static(uploadDir));
router.use('/', express.static(__dirname + '/chocolate/'));
router.use(cookieParser());

router.get('/', (req, res) => {
	res.render('intro.ejs');
});

function log(req, orderid, message) {
	req.app.locals.chocDb.collection('log').insertOne({
		"time": new Date().getTime(),
		"gift": orderid,
		"message": message
	});
}

router.post('/create', async (req, res) => {
	const orderid = req.body.order;
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid})
	if (order != null) {
		// TODO Handle error
		res.redirect('..?e=2');
	} else {
		const salt = namegen();
		const password = req.body.password + global_salt + salt;
		const hash = crypto.createHash('sha256').update(password).digest('hex');
		const session = namegen();

		await req.app.locals.chocDb.collection('gift').insertOne({
			"order": orderid,
			"hash": hash,
			"salt": salt,
			"session": session,
			"content": []
		});
		log(req, orderid, "Gift " + orderid + " created");

		res.cookie('session', session);
		res.redirect('gift/' + orderid + '/edit');
	}
});

router.post('/login', async (req, res) => {
	const orderid = req.body.order;
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid})
	if (order) {
		const password = req.body.password + global_salt + order.salt;
		const hash = crypto.createHash('sha256').update(password).digest('hex');
		if (order.hash === hash) {
			order.session = namegen();
			await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order);

			res.cookie('session', order.session);
			res.redirect('gift/' + orderid + '/edit');
		} else {
			// TODO Handle error
			res.redirect('..?e=1');
		}
	} else {
		res.status(404).send("Not Found");
	}
});

router.get('/qrcode/:orderid', async (req, res) => {
	const orderid = req.body.order;
	const url = 'http://hybridgifting.com/gift/' + orderid;
	await QRCode.toFileStream(res, url);
});

router.get('/api/list', (req, res) => {
	req.app.locals.chocDb.collection('gift').find().toArray()
		.then((result) => {
			// result.forEach((item) => {
			// 	delete item.hash;
			// 	delete item.salt;
			// 	delete item.session;
			// });
			res.json(result);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

router.get('/api/logs', async (req, res) => {
	const result = await req.app.locals.chocDb.collection('log').find().toArray()
	res.json(result);
});

router.get('/gift/:orderid', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid})
	if (order) {
		res.render('view.ejs', order)
	} else {
		res.status(404).send("Not Found");
	}
});

router.get('/gift/:orderid/edit', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid});
	if (order) {
		const session = req.cookies.session;
		if (order.session !== session) {
			res.redirect('../../');
		} else {
			res.render('edit.ejs', order);
		}
	} else {
		res.status(404).send();
	}
});

router.post('/gift/:orderid/deleteItem', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid});
	if (order) {
		const removeIndex = req.body.item;
		let uri = order.content[removeIndex].uri;
		if ((typeof uri === 'string' || uri instanceof String) && uri.startsWith(uploadUri)) {
			uri = uri.replace(uploadUri, uploadDir)
			if (fs.existsSync(uri)) {
				fs.unlinkSync(uri);
			}
		}
		// noinspection EqualityComparisonWithCoercionJS
		order.content = order.content.filter((value, index) => index != removeIndex);
		await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order)
		log(req, orderid, "Item " + removeIndex + " removed");
		res.redirect('edit');
	} else {
		res.status(404).send();
	}
});

router.post('/gift/:orderid/addMessage', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid})
	if (order) {
		order.content.push({
			uri: "",
			mimetype: "text/plain"
		});
		await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order);
		const index = order.content.length;
		log(req, orderid, "Item " + index + " add. Message");
		res.redirect('edit');
	} else {
		res.status(404).send("Not Found");
	}
});

router.post('/gift/:orderid/updateMessage', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid});
	if (order) {
		const itemIndex = req.body.item;
		order.content[itemIndex].uri = req.body.content;
		console.log(order);
		await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order);
		log(req, orderid, "Item " + itemIndex + " edited. Message");
		res.redirect('edit');
	} else {
		res.status(404).send();
	}
});

router.post('/gift/:orderid/addFile', upload.single('file'), async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid})
	if (order) {
		let uri = req.file.path;
		uri = uri.replace(uploadDir, uploadUri);
		order.content.push({
			"uri": uri,
			"mimetype": req.file.mimetype
		});
		await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order);
		const index = order.content.length;
		log(req, orderid, "Item " + index + " add. " + req.file.mimetype);
		res.redirect('edit');
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
router.post('/gift/:orderid/addLink', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid})
	let uri = req.body.link.trim();
	const match = uri.match(youtubeMatcher);
	if (match) {
		order.content.push({
			"uri": match[1],
			"mimetype": 'video/youtube'
		});
		await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order)
		res.redirect('edit');
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
			await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order)
			res.redirect('edit');
		} catch (e) {
			order.content.push({
				"uri": uri,
				"mimetype": 'text/x-uri'
			});
			await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order)
			res.redirect('edit');
		}
	}
});


module.exports = router

