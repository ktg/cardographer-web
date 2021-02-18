import AbortController from "abort-controller";
import {createDocument} from 'domino';
import {fetch} from 'node-fetch';
import type {Request, Response} from "express";

const escapeHTML = str => str.replace(/[&<>'"]/g,
	tag => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		"'": '&#39;',
		'"': '&quot;'
	}[tag]));

async function fetchTimeout(url: string, time: number) {
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

export async function get(req: Request, res: Response) {
	const response = await fetchTimeout('https://www.myrunningman.com/episodes/newest', 10000);
	const html = await response.text();
	const doc = createDocument(html);
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
}