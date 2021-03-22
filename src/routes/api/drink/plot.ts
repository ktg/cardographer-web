import type {Request, Response} from "express";
import simplify from "simplify-js";
import {getMongoCollection} from "../../../shared/db";

function createLine(chart, data, name: string, colour: string) {
	if (data.length > 1) {
		const lineSegments = []
		let currentSegment = []
		let prev = data[0].x
		data.forEach((item) => {
			currentSegment.push(item)
			if (Math.abs(prev - item.x) >= 1000) {
				lineSegments.push(simplify(currentSegment, 0.01, false))
			}
			prev = item.x
		});

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
		lineSegments.forEach((segment) => {
			segment.forEach((point) => {
				line.x.push(new Date(point.x).toISOString());
				line.y.push(point.y);

			})
			line.x.push(null);
			line.y.push(null);
		});
		chart.push(line);
	}
}

export async function get(req: Request, res: Response) {
	const result = await getMongoCollection(req, 'drink').find().sort({"device": 1, "time": 1}).toArray();

	let data = []
	let magdata = []
	let drinkdata = []
	let device = "";

	result.push({device: "end"})
	result.forEach((item) => {
		if (item.device !== device) {
			createLine(data, magdata, device, '#445')
			createLine(data, drinkdata, device + " Drinking", '#252')

			magdata = []
			drinkdata = []
			device = item.device
		}

		if ('x' in item) {
			if (item.tag == "drink") {
				drinkdata.push({x: item.time, y: item.x + item.y + item.z})
			} else {
				magdata.push({x: item.time, y: item.x + item.y + item.z})
			}
		}
	});

	res.json(data)
}