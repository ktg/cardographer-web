import AbortController from "abort-controller";
import {createDocument} from 'domino';
import fetch from 'node-fetch';
import type {Response as FetchResponse} from 'node-fetch';
import type {Request, Response} from "express";

const escapeHTML = str => str.replace(/[&<>'"]/g,
	tag => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		"'": '&#39;',
		'"': '&quot;'
	}[tag]));

async function fetchTimeout(url: string, time: number): Promise<FetchResponse> {
	const controller = new AbortController();
	const timeout = setTimeout(() => {
		controller.abort();
	}, time);

	try {
		return await fetch(url, {signal: controller.signal});
	} finally {
		clearTimeout(timeout);
	}
}

export async function get(req: Request, res: Response) {
	const response = await fetchTimeout('https://www.myrunningman.com/episodes/newest', 10000);
	if (response.ok) {
		const html = await response.text()
		const doc = createDocument(html)
		const links = doc.getElementsByTagName('a')
		const linkList = Array.prototype.slice.call(links)
		let previousLink = null
		res.set('Content-Type', 'text/xml; charset=UTF-8')
		res.write('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>MyRunningMan Most Recent Episodes</title>')
		linkList.forEach((link) => {
			if (link.href.startsWith('magnet:')) {
				res.write('<item><title>');
				res.write(escapeHTML(previousLink.textContent));
				res.write('</title><link>');
				res.write(escapeHTML(link.href.replace('magnet://', 'magnet:')));
				res.write('</link></item>')
			}

			previousLink = link;
		});
		res.write('</channel></rss>');
		res.end();
	} else {
		res.status(response.status).send(response.statusText)
	}
}