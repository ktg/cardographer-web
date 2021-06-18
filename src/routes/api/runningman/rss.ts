import type {EndpointOutput} from "@sveltejs/kit";
import AbortController from "abort-controller"
import {createDocument} from 'domino'
import type {Response as FetchResponse} from 'node-fetch'
import fetch from 'node-fetch';

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

export async function get(): Promise<EndpointOutput> {
	const response = await fetchTimeout('https://www.myrunningman.com/episodes/newest', 10000);
	if (response.ok) {
		const html = await response.text()
		const doc = createDocument(html)
		const links = doc.getElementsByTagName('a')
		const linkList = Array.prototype.slice.call(links)
		let previousLink = null
		let body = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>MyRunningMan Most Recent Episodes</title>'
		linkList.forEach((link) => {
			if (link.href.startsWith('magnet:')) {
				body += '<item><title>'
					+ escapeHTML(previousLink.textContent)
					+ '</title><link>'
					+ escapeHTML(link.href.replace('magnet://', 'magnet:'))
					+ '</link></item>'
			}

			previousLink = link;
		})
		body += '</channel></rss>'

		return {
			body: body,
			headers: {
				'Content-Type': 'text/xml; charset=UTF-8'
			}
		}
	} else {
		return {status: response.status, body: response.statusText}
	}
}