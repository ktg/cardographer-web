const fetch = require('node-fetch');
const AbortController = require('abort-controller');

module.exports = async function fetchTimeout(url, time) {
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
