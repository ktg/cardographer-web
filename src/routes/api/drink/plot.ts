import simplify from "simplify-js";
import type {Request, Response} from "express";
import {getMongoCollection} from "../../../shared/db";

function createLine(chart, data, name: string, colour: string) {
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
		let prev = simple[0].x;
		simple.forEach((item) => {
			if (Math.abs(prev - item.x) >= 1000) {
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

export async function get(req: Request, res: Response) {
	const result = await getMongoCollection(req, 'drink').find().sort({"device": 1, "time": 1}).toArray();

	let data = [];
	let magdata = [];
	//let ydata = [];
	//let zdata = [];
	let device = "";

	result.forEach((item) => {
		if (item.device !== device) {
			createLine(data, magdata, device, '#534');
			//createLine(data, ydata, device + " y", '#4B4');
			//createLine(data, zdata, device + " z", '#44B');

			magdata = [];
			//ydata = [];
			//zdata = [];
			device = item.device
		}

		if ('x' in item) {
			magdata.push({x: item.time, y: Math.abs(item.x) + Math.abs(item.y) + Math.abs(item.z)});
			//ydata.push({x: item.time, y: item.y});
			//zdata.push({x: item.time, y: item.z});
		}
	});
	createLine(data, magdata, device, '#534');
	//createLine(data, ydata, device + " y", '#4B4');
	//createLine(data, zdata, device + " z", '#44B');

	res.json(data);
}