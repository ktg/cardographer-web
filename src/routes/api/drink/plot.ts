import type {Request, Response} from "express";
import simplify from "simplify-js";
import {getMongoCollection} from "../../../shared/db";

export async function get(req: Request, res: Response) {
	const result = await getMongoCollection(req, 'drink').find().sort({"device": 1, "time": 1}).toArray();

	let lines = []
	let data = []

	result.push({x: 0, device: "end"})
	result.forEach((item) => {
		if (typeof item.x === "number") {
			if (data.length > 0) {
				const prev = data[data.length - 1]
				console.info("" + item.tag + " == " + prev.tag + " = " + (item.tag != prev.tag) + " / " + (item.tag !== prev.tag))
				if (item.device != prev.device || item.tag != prev.tag) {
					if (prev.device == item.device) {
						data.push(convertItem(item))
					}
					if (prev.tag == 'drink') {
						createLine(lines, data, prev.device + " Drinking", '#282')
					} else {
						createLine(lines, data, prev.device, '#558')
					}

					data = []
				}
			}

			data.push(convertItem(item))
		}
	})

	res.json(lines)
}

function convertItem(item) {
	return {x: item.time, y: item.x + item.y + item.z}
}

function createLine(lines, data, name: string, colour: string) {
	const lineSegments = []
	let currentSegment = []
	let prev = data[0].x
	data.forEach((item) => {
		if (Math.abs(prev - item.x) >= 1000) {
			lineSegments.push(simplify(currentSegment, 0.02, false))
			currentSegment = []
		}
		currentSegment.push(item)
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
	lines.push(line);
}