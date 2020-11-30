const express = require('express');
const router = express.Router();
const domino = require('domino');
const fetch = require('./fetchTimeout');

const escapeHTML = str => str.replace(/[&<>'"]/g,
	tag => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		"'": '&#39;',
		'"': '&quot;'
	}[tag]));

router.get('/rss', async (req, res) => {
	const response = await fetch('https://www.myrunningman.com/episodes/newest', 10000);
	const html = await response.text();
	const doc = domino.createWindow(html).document;
	const links = doc.getElementsByTagName('a');
	const linkList = Array.prototype.slice.call(links);
	let previousLink = null;
	res.set('Content-Type', 'text/xml; charset=UTF-8');
	res.write('<?xml version="1.0" encoding="UTF-8"?>');
	res.write('<rss version="2.0">');
	res.write('<channel>');
	res.write('<title>MyRunningMan Most Recent Episodes</title>');
	linkList.forEach((link) => {
		if (link.href.startsWith('magnet:')) {
			res.write('<item>');
			res.write('<title>');
			res.write(escapeHTML(previousLink.textContent));
			res.write('</title>');
			res.write('<link>');
			res.write(escapeHTML(link.href.replace('magnet://', 'magnet:')));
			res.write('</link>');
			res.write('</item>')
		}

		previousLink = link;
	});
	res.write('</channel>');
	res.write('</rss>');
	res.end();
});

module.exports = router