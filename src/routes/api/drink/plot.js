const simplify = require("simplify-js");

function createLine(chart, data, name, colour) {
	if (data.length > 1) {
		const simple = simplify(data, 0.01, false);
		let line = {
			x: [],
			y: [],
			mode: 'lines',
			name: name,
			line: {
				color: colour,
				width: 1
			}
		};
		let prev = simple.x[0];
		simple.forEach((item) => {
			if(Math.abs(prev - item.x) >= 1000) {
				line.x.push(null);
				line.y.push(null);
			}
			line.x.push(new Date(item.x).toISOString());
			line.y.push(item.y);
			prev = item.x;
		});
		chart.push(line);
	}
}

export async function get(req, res, _) {
	const result = await req.app.locals.db.collection('drink').find().sort({"device": 1, "time": 1}).toArray();

	let data = [];
	let xdata = [];
	let ydata = [];
	let zdata = [];
	let device = "";

	result.forEach((item) => {
		if (item.device !== device) {
			createLine(data, xdata, device + " x", '#B44');
			createLine(data, ydata, device + " y", '#4B4');
			createLine(data, zdata, device + " z", '#44B');

			xdata = [];
			ydata = [];
			zdata = [];
			device = item.device
		}

		if ('ax' in item) {
			xdata.push({x: item.time, y: item.ax});
			ydata.push({x: item.time, y: item.ay});
			zdata.push({x: item.time, y: item.az});
		}
	});
	createLine(data, xdata, device + " x", '#B44');
	createLine(data, ydata, device + " y", '#4B4');
	createLine(data, zdata, device + " z", '#44B');

	res.json(data);
}