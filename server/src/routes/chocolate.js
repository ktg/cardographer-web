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
const fetch = require('./fetchTimeout');

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
	res.render('intro.ejs', {order: '', login: false, error: ''});
});

function log(req, orderid, message) {
	// noinspection JSIgnoredPromiseFromCall
	req.app.locals.chocDb.collection('log').insertOne({
		"time": new Date().getTime(),
		"gift": orderid,
		"message": message
	});
}

router.post('/create', async (req, res) => {
	const orderid = req.body.order;
	if (!orderid || !req.body.password || !req.body.confirm) {
		res.render('intro.ejs', {order: orderid, login: false, error: 'Missing order or passwords'});
	}
	if (typeof orderid === 'number' && isFinite(orderid)) {
		res.render('intro.ejs', {order: orderid, login: false, error: 'Order is not a valid number'});
	}
	if (req.body.password !== req.body.confirm) {
		res.render('intro.ejs', {order: orderid, login: false, error: 'Passwords must match'});
	}
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid})
	if (order != null) {
		res.render('intro.ejs', {order: orderid, login: false, error: 'That order already exists'});
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
			"creation": new Date().getTime(),
			"content": [{}, {}, {}, {}]
		});
		log(req, orderid, "Gift " + orderid + " created");

		res.cookie('session', session);
		res.redirect('gift/' + orderid + '/edit');
	}
});

router.post('/login', async (req, res) => {
	const orderid = req.body.order;
	if (!orderid || !req.body.password) {
		res.render('intro.ejs', {order: orderid, login: true, error: 'Missing order or password'});
	}
	if (typeof orderid === 'number' && isFinite(orderid)) {
		res.render('intro.ejs', {order: orderid, login: true, error: 'Order is not a valid number'});
	}

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
			res.render('intro.ejs', {order: orderid, login: true, error: 'Order and password do not match'});
		}
	} else {
		res.render('intro.ejs', {order: orderid, login: true, error: 'Order and password do not match'});
	}
});

router.get('/qrcode/:orderid', async (req, res) => {
	const orderid = req.params['orderid'];
	const url = 'http://hybridgifting.com/gift/' + orderid;
	await QRCode.toFileStream(res, url);
});

router.get('/list/XyuWdahM55yCTyF8dxcK', async (req, res) => {
	const pageOrders = 20;
	const page = req.query.page || 0;
	const start = page * pageOrders;
	const count = await req.app.locals.chocDb.collection('gift').count();
	const orders = await req.app.locals.chocDb.collection('gift').find().sort({
		creation: -1,
		order: -1
	}).collation({locale: "en_US", numericOrdering: true}).skip(start).limit(pageOrders).toArray()
	const end = start + orders.length;
	console.log(end);
	console.log(count);
	res.render('list.ejs', {orders: orders, page: page, nextPage: end < count, prevPage: page != 0})
});

// router.get('/api/list', (req, res) => {
// 	req.app.locals.chocDb.collection('gift').find().toArray()
// 		.then((result) => {
// 			// result.forEach((item) => {
// 			// 	delete item.hash;
// 			// 	delete item.salt;
// 			// 	delete item.session;
// 			// });
// 			res.json(result);
// 		})
// 		.catch((err) => {
// 			console.log(err);
// 			res.status(500).send(err);
// 		});
// });

router.get('/api/logs', async (req, res) => {
	const result = await req.app.locals.chocDb.collection('log').find().toArray()
	res.json(result);
});

router.get('/gift/:orderid', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid})
	if (order) {
		order.prefix = '../'
		if (!req.path.endsWith('/')) {
			order.prefix = '';
			order.content.forEach((item) => {
				if (item && item.uri) {
					console.log(item.uri);
					item.uri = item.uri.replace(/^..\//, '');
					console.log(item.uri)
				}
			})
		}
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
			while (order.content.length < 4) {
				order.content.push({});
			}
			order.content.length = 4;
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
		order.content[removeIndex] = {};
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
		const index = req.body.item;
		order.content[index] = {
			uri: "",
			mimetype: "text/plain"
		};
		await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order);
		log(req, orderid, "Item " + index + " added message");
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
		log(req, orderid, "Item " + itemIndex + " edited message");
		res.redirect('edit');
	} else {
		res.status(404).send();
	}
});

router.get('/gift/:orderid/delete/LEsWz26vmvSTwBXr9YMS', upload.single('file'), async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid})
	if (order) {
		await req.app.locals.chocDb.collection('gift').deleteOne({"order": orderid})
		res.status(200).send("success");
	} else {
		res.status(404).send();
	}
});

router.post('/gift/:orderid/addFile', upload.single('file'), async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid})
	if (order) {
		const index = req.body.item;
		let uri = req.file.path;
		uri = uri.replace(uploadDir, uploadUri);
		order.content[index] = {
			"uri": uri,
			"mimetype": req.file.mimetype
		};
		await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order);
		log(req, orderid, "Item " + index + " added upload " + req.file.mimetype);
		res.redirect('edit');
	} else {
		res.status(404).send();
	}
});

router.post('/gift/:orderid/addLink', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid})
	if (order) {
		const index = req.body.item;
		order.content[index] = {
			mimetype: "text/x-uri"
		};
		await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order);
		log(req, orderid, "Item " + index + " added link");
		res.redirect('edit');
	} else {
		res.status(404).send("Not Found");
	}
});

const youtubeMatcher = new RegExp('^(?:.+?)?(?:\\/v\\/|watch\\/|\\?v=|&v=|youtu\\.be\\/|\\/v=|^youtu\\.be\\/|watch%3Fv%3D)([a-zA-Z0-9_-]{11})+$', 'i');
router.post('/gift/:orderid/editLink', async (req, res) => {
	const orderid = req.params['orderid'];
	const order = await req.app.locals.chocDb.collection('gift').findOne({"order": orderid})
	if (order != null) {
		const index = req.body.item;
		let uri = req.body.link.trim();
		const match = uri.match(youtubeMatcher);
		if (match) {
			order.content[index] = {
				"uri": match[1],
				"mimetype": 'video/youtube'
			};
			await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order)
			log(req, orderid, "Item " + index + " edited link youtube: " + uri);
			res.redirect('edit');
		} else {
			try {
				const response = await fetch(uri, 3000);
				const contentType = response.headers.get("content-type");
				if (contentType && (contentType.startsWith("video/") || contentType.startsWith("audio/") || contentType.startsWith("image/"))) {
					order.content[index] = {
						"uri": uri,
						"mimetype": contentType,
					};
					log(req, orderid, "Item " + index + " edited link " + contentType + ": " + uri);
				} else {
					const html = await response.text();
					const doc = domino.createWindow(html).document;
					const metadata = getMetadata(doc, uri);
					console.log(metadata);
					order.content[index] = {
						"uri": uri,
						"mimetype": 'text/x-uri',
						"title": metadata.title,
						"description": metadata.description,
						"icon": metadata.icon,
						"image": metadata.image,
						"provider": metadata.provider
					};
				}
				log(req, orderid, "Item " + index + " edited link " + uri);
				await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order)
				res.redirect('edit');
			} catch (e) {
				order.content[index] = {
					"uri": uri,
					"mimetype": 'text/x-uri'
				};
				log(req, orderid, "Item " + index + " edited link " + uri);
				await req.app.locals.chocDb.collection('gift').replaceOne({"order": orderid}, order)
				res.redirect('edit');
			}
		}
	} else {
		res.status(404).send("Not Found");
	}
});


router.use(function (req, res) {
	res.status(404).send("Not Found");
});

module.exports = router

